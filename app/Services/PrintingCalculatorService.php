<?php

namespace App\Services;

use App\Models\Percetakan\PercetakanProduct;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * PrintingCalculatorService
 * 
 * Server-side price calculator for all printing products.
 * Standarisasi: Mahameru.id industry standards.
 */
class PrintingCalculatorService
{
    /**
     * Calculate price for a printing order with robust null safety.
     */
    public function calculate(array $params): array
    {
        try {
            $productId = $params['product_id'] ?? null;
            if (!$productId) {
                throw new \InvalidArgumentException("Product ID is required for calculation.");
            }

            $product = PercetakanProduct::find($productId);
            if (!$product) {
                throw new \Exception("Product with ID {$productId} not found.");
            }

            $quantity = max(0.01, (float)($params['quantity'] ?? 1));

            $result = match ($product->pricing_model) {
                'area_based'  => $this->calculateAreaBased($product, $params, $quantity),
                'volume_tier' => $this->calculateVolumeTier($product, $params, $quantity),
                'per_page'    => $this->calculatePerPage($product, $params, $quantity),
                'fixed_size'  => $this->calculateFixedSize($product, $params, $quantity),
                default       => $this->calculateVolumeTier($product, $params, $quantity),
            };

            return array_merge([
                'success' => true,
                'timestamp' => now()->toIso8601String(),
            ], $result);

        } catch (\Throwable $e) {
            Log::error("Printing Calculation Error: " . $e->getMessage(), [
                'params' => $params,
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'message' => $e->getMessage(),
                'total_price' => 0,
                'unit_price' => 0
            ];
        }
    }

    /**
     * Area-based Calculation
     */
    private function calculateAreaBased(PercetakanProduct $product, array $params, float $quantity): array
    {
        $widthM  = (float)($params['width_cm'] ?? 100) / 100;
        $heightM = (float)($params['height_cm'] ?? 100) / 100;
        $area    = max(0.0001, $widthM * $heightM);

        $minArea = (float)($product->min_order_area ?? 1);
        $billableArea = max($area, $minArea);

        $pricePerM2 = $this->getPricePerUnit($product, $params, (int)$quantity);
        $basePrice   = $billableArea * $pricePerM2;

        $finishingFees = $this->calculateFinishingFees($params, $basePrice, (int)$quantity);

        $unitPrice  = $basePrice + ($finishingFees / $quantity);
        $totalPrice = ($basePrice * $quantity) + $finishingFees;

        return [
            'unit_price'    => (float)round($unitPrice, 2),
            'total_price'   => (float)round($totalPrice, 2),
            'area_m2'       => (float)round($billableArea, 4),
            'quantity'      => $quantity,
            'print_method'  => 'digital',
            'weight_kg'     => (float)round($billableArea * 0.3 * $quantity, 2),
            'details'       => [
                'billable_area' => $billableArea,
                'base_price_m2' => $pricePerM2,
                'finishing_fees' => $finishingFees
            ]
        ];
    }

    /**
     * Volume-tier Calculation
     */
    private function calculateVolumeTier(PercetakanProduct $product, array $params, float $quantity): array
    {
        $tier = $this->findPriceTier($product, $params, (int)$quantity);

        $baseUnitPrice = (float)($tier ? $tier->price_per_unit : $product->base_price);
        $discountPct   = (float)($tier ? $tier->discount_percent : 0);
        $printMethod   = $tier ? $tier->print_method : 'digital';

        if ($product->digital_max_qty && $quantity > $product->digital_max_qty) {
            $printMethod = 'offset';
        }

        $discountedPrice = $baseUnitPrice * (1 - $discountPct / 100);
        $finishingFees = $this->calculateFinishingFees($params, $discountedPrice, (int)$quantity);
        
        $totalPrice = ($discountedPrice * $quantity) + $finishingFees;
        $unitPrice = $quantity > 0 ? $totalPrice / $quantity : $discountedPrice;

        return [
            'unit_price'      => (float)round($unitPrice, 2),
            'total_price'     => (float)round($totalPrice, 2),
            'discount_percent' => $discountPct,
            'print_method'    => $printMethod,
            'quantity'        => $quantity,
            'weight_kg'       => (float)round(((float)($params['paper_gsm'] ?? 150) * 0.06 * $quantity) / 1000, 2),
            'details'         => [
                'tier_base' => $baseUnitPrice,
                'finishing_fees' => $finishingFees
            ]
        ];
    }

    /**
     * Per-page Calculation (Books)
     */
    private function calculatePerPage(PercetakanProduct $product, array $params, float $quantity): array
    {
        $pageCount = max(2, (int)($params['page_count'] ?? 50));
        if ($pageCount % 2 !== 0) $pageCount++;
        
        $colorMode = $params['color_mode'] ?? 'fullcolor';
        $coverCost = (float)($product->base_price ?? 5000); 
        $perPageRate = $colorMode === 'bw' ? 150 : 500; 

        $bindingType = $params['binding_type'] ?? 'perfect';
        $bindingCost = match ($bindingType) {
            'perfect'      => 3000,
            'saddle_stitch' => 1500,
            'wire_o'       => 5000,
            default        => 3000,
        };

        $finishingFees = $this->calculateFinishingFees($params, 0, (int)$quantity);
        $unitPrice = $coverCost + ($pageCount * $perPageRate) + $bindingCost + ($finishingFees / max($quantity, 1));

        $tier = $this->findPriceTier($product, $params, (int)$quantity);
        $discountPct = (float)($tier ? $tier->discount_percent : 0);
        $unitPrice *= (1 - $discountPct / 100);

        // Spine Calculation
        $paperType = $params['paper_type'] ?? 'hvs';
        $gsm = (int)($params['paper_gsm'] ?? 70);
        $thickness = $this->getThicknessFactor($gsm, $paperType);
        $spineWidth = ($pageCount / 2) * $thickness + ($bindingType === 'perfect' ? 0.5 : 0);

        return [
            'unit_price'      => (float)round($unitPrice, 2),
            'total_price'     => (float)round($unitPrice * $quantity, 2),
            'spine_width_mm'  => (float)round($spineWidth, 2),
            'page_count'      => $pageCount,
            'print_method'    => $quantity >= 100 ? 'offset' : 'digital',
            'quantity'        => $quantity,
            'weight_kg'       => (float)round(($pageCount * 0.005 * $quantity), 2),
            'details'         => [
                'cover_cost' => $coverCost,
                'pages_cost' => $pageCount * $perPageRate,
                'binding_cost' => $bindingCost
            ]
        ];
    }

    /**
     * Fixed-size Calculation (Stickers)
     */
    private function calculateFixedSize(PercetakanProduct $product, array $params, float $quantity): array
    {
        $sheetCount = max(1, (float)($params['sheet_count'] ?? $quantity));
        
        $tier = $this->findPriceTier($product, $params, (int)$sheetCount);
        $pricePerSheet = (float)($tier ? $tier->price_per_unit : $product->base_price);
        
        $cuttingMethod = $params['cutting_method'] ?? 'no_cut';
        $cuttingFee = match ($cuttingMethod) {
            'square_cut' => 500 * $sheetCount,
            'kiss_cut'   => 1500 * $sheetCount,
            'die_cut'    => 2500 * $sheetCount,
            default      => 0,
        };

        $totalPrice = ($pricePerSheet * $sheetCount) + $cuttingFee;

        return [
            'unit_price'      => (float)round($totalPrice / $sheetCount, 2),
            'total_price'     => (float)round($totalPrice, 2),
            'sheet_count'     => $sheetCount,
            'print_method'    => 'digital',
            'quantity'        => $quantity,
            'details'         => [
                'price_per_sheet' => $pricePerSheet,
                'cutting_fee' => $cuttingFee
            ]
        ];
    }

    private function findPriceTier(PercetakanProduct $product, array $params, int $quantity): ?object
    {
        return DB::table('percetakan_price_tiers')
            ->where('product_id', $product->id)
            ->where('min_qty', '<=', $quantity)
            ->orderBy('min_qty', 'desc')
            ->first();
    }

    private function getPricePerUnit(PercetakanProduct $product, array $params, int $quantity): float
    {
        $tier = $this->findPriceTier($product, $params, $quantity);
        return (float)($tier ? $tier->price_per_unit : $product->base_price);
    }

    private function calculateFinishingFees(array $params, float $basePrice, int $quantity): float
    {
        $fees = 0;
        $finishings = (array)($params['finishings'] ?? []);

        foreach ($finishings as $code) {
            $opt = DB::table('percetakan_finishing_options')->where('code', $code)->where('is_active', true)->first();
            if ($opt) {
                $fees += match ($opt->pricing_type) {
                    'per_unit'   => (float)$opt->price * $quantity,
                    'flat_fee'   => (float)$opt->price,
                    'percentage' => $basePrice * $quantity * ((float)$opt->price / 100),
                    default      => (float)$opt->price * $quantity,
                };
            }
        }
        return (float)$fees;
    }

    private function getThicknessFactor(int $gsm, string $type): float
    {
        return match (strtolower($type)) {
            'bookpaper' => $gsm <= 57 ? 0.12 : 0.15,
            'artpaper'  => $gsm <= 120 ? 0.10 : 0.13,
            default     => $gsm <= 70 ? 0.09 : 0.11,
        };
    }

    private function buildResult(PercetakanProduct $product, array $data): array
    {
        return array_merge([
            'product_id'   => $product->id,
            'product_name' => $product->name,
            'category'     => $product->category,
            'estimated_days' => '2-3',
        ], $data);
    }
}
