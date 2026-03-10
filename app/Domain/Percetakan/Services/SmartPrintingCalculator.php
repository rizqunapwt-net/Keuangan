<?php

namespace App\Domain\Percetakan\Services;

use App\Models\PercetakanProduct;
use App\Models\PercetakanPriceTier;
use App\Models\PercetakanFinishingOption;
use Illuminate\Support\Collection;

/**
 * Smart Printing Calculator Service
 * 
 * Menghitung harga percetakan berdasarkan:
 * - Area-based (PxL) untuk spanduk/banner
 * - Volume-based (Tier Qty) untuk brosur/flyer
 * - Fixed-size untuk display products
 * 
 * Inspired by Mahameru.id pricing logic
 */
class SmartPrintingCalculator
{
    /**
     * Calculate total price for an order
     * 
     * @param int $productId Product ID
     * @param float $width Width in meters (for area-based)
     * @param float $height Height in meters (for area-based)
     * @param float $quantity Quantity (for volume-based or piece count)
     * @param array $finishingOptions Array of finishing option IDs with quantities
     * @return array Complete pricing breakdown
     */
    public function calculate(
        int $productId,
        float $width = 1,
        float $height = 1,
        float $quantity = 1,
        array $finishingOptions = []
    ): array {
        $product = PercetakanProduct::with('priceTiers')->findOrFail($productId);
        
        // Calculate base price based on calc_type
        $calculation = match($product->calc_type) {
            'area' => $this->calculateAreaBased($product, $width, $height, $quantity),
            'volume' => $this->calculateVolumeBased($product, $quantity),
            'fixed' => $this->calculateFixedBased($product, $quantity),
            default => throw new \InvalidArgumentException("Unknown calc_type: {$product->calc_type}"),
        };
        
        // Calculate finishing costs
        $finishingDetails = $this->calculateFinishing(
            $finishingOptions,
            $calculation['area'] ?? 0,
            $calculation['quantity'],
            $calculation['perimeter'] ?? 0
        );
        
        // Calculate total
        $baseTotal = $calculation['unit_price'] * $calculation['billable_quantity'];
        $finishingTotal = array_sum(array_column($finishingDetails['items'], 'subtotal'));
        $grandTotal = $baseTotal + $finishingTotal;
        
        return [
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'category' => $product->category,
                'calc_type' => $product->calc_type,
            ],
            'specifications' => $calculation['specifications'],
            'pricing' => [
                'unit_price' => $calculation['unit_price'],
                'billable_quantity' => $calculation['billable_quantity'],
                'base_total' => round($baseTotal, 2),
                'finishing_total' => round($finishingTotal, 2),
                'grand_total' => round($grandTotal, 2),
            ],
            'finishing' => $finishingDetails,
            'production_time' => $this->estimateProductionTime($product, $calculation['billable_quantity']),
        ];
    }

    /**
     * Calculate area-based pricing (spanduk, banner, sticker)
     */
    private function calculateAreaBased(
        PercetakanProduct $product,
        float $width,
        float $height,
        float $quantity
    ): array {
        // Calculate area in m²
        $area = $width * $height;
        
        // Apply min order
        $billableArea = max($area, $product->min_order);
        
        // Find applicable tier price
        $tier = $product->priceTiers()
            ->where('min_quantity', '<=', $billableArea)
            ->orderBy('min_quantity', 'desc')
            ->first();
        
        $unitPrice = $tier?->price ?? $product->base_price;
        
        // Total billable quantity (area × quantity if multiple copies)
        $totalBillableArea = $billableArea * $quantity;
        
        return [
            'area' => round($area, 2),
            'width' => $width,
            'height' => $height,
            'quantity' => $quantity,
            'billable_quantity' => round($totalBillableArea, 2),
            'unit_price' => $unitPrice,
            'specifications' => [
                'dimensions' => "{$width}m × {$height}m",
                'area_per_unit' => round($area, 2) . ' m²',
                'total_area' => round($totalBillableArea, 2) . ' m²',
                'min_order_applied' => $area < $product->min_order,
            ],
            'perimeter' => 2 * ($width + $height), // For finishing calculations
        ];
    }

    /**
     * Calculate volume-based pricing (brosur, flyer, kartu nama)
     */
    private function calculateVolumeBased(
        PercetakanProduct $product,
        float $quantity
    ): array {
        // Find applicable tier price
        $tier = $product->priceTiers()
            ->where('min_quantity', '<=', $quantity)
            ->orderBy('min_quantity', 'desc')
            ->first();
        
        $unitPrice = $tier?->price ?? $product->base_price;
        
        // Apply min order
        $billableQuantity = max($quantity, $product->min_order);
        
        return [
            'quantity' => $quantity,
            'billable_quantity' => $billableQuantity,
            'unit_price' => $unitPrice,
            'specifications' => [
                'ordered_qty' => $quantity,
                'billable_qty' => $billableQuantity,
                'min_order_applied' => $quantity < $product->min_order,
                'tier_applied' => $tier?->description ?? 'Base price',
            ],
        ];
    }

    /**
     * Calculate fixed-size pricing (roll-up banner, x-banner, tripod)
     */
    private function calculateFixedBased(
        PercetakanProduct $product,
        float $quantity
    ): array {
        $unitPrice = $product->base_price;
        $billableQuantity = max($quantity, $product->min_order);
        
        return [
            'quantity' => $quantity,
            'billable_quantity' => $billableQuantity,
            'unit_price' => $unitPrice,
            'specifications' => [
                'ordered_qty' => $quantity,
                'billable_qty' => $billableQuantity,
                'includes_stand' => true,
            ],
        ];
    }

    /**
     * Calculate finishing costs
     */
    private function calculateFinishing(
        array $options,
        float $area = 0,
        float $quantity = 1,
        float $perimeter = 0
    ): array {
        $items = [];
        $total = 0;
        
        foreach ($options as $optionData) {
            $optionId = $optionData['id'] ?? null;
            $optionQuantity = $optionData['quantity'] ?? 1;
            
            if (!$optionId) {
                continue;
            }
            
            $option = PercetakanFinishingOption::find($optionId);
            if (!$option) {
                continue;
            }
            
            $unitPrice = $option->calculatePrice($area, $quantity, $perimeter);
            $subtotal = $unitPrice * $optionQuantity;
            
            $items[] = [
                'id' => $option->id,
                'name' => $option->name,
                'price_type' => $option->price_type,
                'unit_price' => round($unitPrice, 2),
                'quantity' => $optionQuantity,
                'subtotal' => round($subtotal, 2),
            ];
            
            $total += $subtotal;
        }
        
        return [
            'items' => $items,
            'total' => round($total, 2),
        ];
    }

    /**
     * Estimate production time in days
     */
    private function estimateProductionTime(
        PercetakanProduct $product,
        float $quantity
    ): int {
        $baseTime = match($product->category) {
            'spanduk_banner' => 1,
            'sticker' => 2,
            'brosur' => 2,
            'display' => 1,
            default => 2,
        };
        
        // Add time for large quantities
        if ($quantity > 100) {
            $baseTime += (int)($quantity / 100);
        }
        
        return $baseTime;
    }

    /**
     * Get all available products with their base info
     */
    public function getAvailableProducts(?string $category = null): Collection
    {
        $query = PercetakanProduct::with('priceTiers')
            ->active()
            ->orderBy('category')
            ->orderBy('name');
        
        if ($category) {
            $query->where('category', $category);
        }
        
        return $query->get();
    }

    /**
     * Get all available finishing options
     */
    public function getAvailableFinishingOptions(?string $category = null): Collection
    {
        $query = PercetakanFinishingOption::active()
            ->orderBy('category')
            ->orderBy('name');
        
        if ($category) {
            $query->where('category', $category);
        }
        
        return $query->get();
    }
}
