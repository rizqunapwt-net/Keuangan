<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Percetakan Calculator API Controller
 * 
 * Simple calculator for printing prices (spanduk, sticker, display)
 * Used by frontend and MCP agents
 */
class PercetakanCalculatorController extends Controller
{
    /**
     * Hardcoded pricing data (can be moved to database later)
     */
    private const PRODUCT_PRICES = [
        // Spanduk (per m²)
        'spanduk_vinyl_280' => 25000,
        'spanduk_vinyl_340' => 32000,
        'spanduk_vinyl_440' => 42000,
        'spanduk_kain' => 35000,
        'spanduk_canvas' => 65000,
        'spanduk_albatros' => 28000,
        'spanduk_luster' => 32000,
        'spanduk_mesh' => 55000,
        
        // Sticker (per m²)
        'sticker_vinyl' => 55000,
        'sticker_ritrama' => 75000,
        'sticker_one_way' => 95000,
        
        // Display (per unit, stand included)
        'rollup_banner' => 150000,
        'x_banner' => 100000,
        'backdrop_portable' => 200000,
        
        // Flyer/Brosur (per 100 pcs, base price A4)
        'flyer_art_paper_120gsm' => 8000,
        'flyer_art_paper_150gsm' => 9500,
        'flyer_art_paper_190gsm' => 12000,
        'flyer_art_paper_230gsm' => 15000,
        'flyer_art_paper_260gsm' => 18000,
        'flyer_hvs_80gsm' => 6000,
        'flyer_hvs_100gsm' => 7500,
        'flyer_ivory_210gsm' => 14000,
        'flyer_ivory_250gsm' => 17000,
        'flyer_ivory_310gsm' => 21000,
        
        // Kartu Nama (per 100 pcs)
        'kartu_nama_art_carton_260gsm' => 25000,
        'kartu_nama_art_carton_310gsm' => 30000,
        'kartu_nama_solid_white' => 35000,
        'kartu_nama_transparent' => 45000,
        
        // NCR Form (per 100 sets, 2-4 ply)
        'ncr_2ply_a4' => 18000,
        'ncr_2ply_a5' => 12000,
        'ncr_3ply_a4' => 24000,
        'ncr_3ply_a5' => 16000,
        'ncr_4ply_a4' => 30000,
        'ncr_4ply_a5' => 20000,
        
        // Dokumen (per 100 pcs)
        'amplop_f4' => 25000,
        'amplop_a4' => 30000,
        'map_kertas' => 35000,
        
        // Buku (per 50 pcs, per 100 pages)
        'buku_softcover_a5' => 25000,
        'buku_softcover_a4' => 35000,
        'buku_hardcover_a5' => 45000,
        'buku_hardcover_a4' => 60000,
    ];

    /**
     * Finishing prices
     */
    private const FINISHING_PRICES = [
        // Spanduk finishing
        'mata_ayam' => 2000,
        'mata_ayam_logam' => 3000,
        'slongson' => 10000,
        'lubang_kayu' => 15000,
        'hemming' => 5000,
        'lipat_saja' => 5000,
        
        // Brosur finishing
        'laminasi_doff' => 200,
        'laminasi_glossy' => 180,
        'laminasi_elegant' => 350,
        'lipat_2' => 50,
        'lipat_3' => 80,
        
        // Sticker cutting
        'kiss_cut' => 15000,
        'die_cut' => 25000,
        'square_cut' => 10000,
    ];

    /**
     * Quantity discount tiers
     */
    private const QUANTITY_TIERS = [
        'spanduk' => [
            ['min' => 10, 'discount' => 8],
            ['min' => 50, 'discount' => 16],
            ['min' => 100, 'discount' => 24],
        ],
        'sticker' => [
            ['min' => 10, 'discount' => 5],
            ['min' => 50, 'discount' => 10],
        ],
        'rollup_banner' => [
            ['min' => 5, 'discount' => 5],
            ['min' => 10, 'discount' => 10],
        ],
    ];

    /**
     * Calculate printing price
     * 
     * @OA\Post(
     *     path="/api/v1/percetakan/calculate",
     *     summary="Calculate printing price",
     *     tags={"Percetakan"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"category", "product_code", "quantity"},
     *             @OA\Property(property="category", type="string", enum={"spanduk", "sticker", "display"}),
     *             @OA\Property(property="product_code", type="string"),
     *             @OA\Property(property="width_cm", type="number"),
     *             @OA\Property(property="height_cm", type="number"),
     *             @OA\Property(property="quantity", type="integer"),
     *             @OA\Property(property="finishing", type="array", @OA\Items(type="string"))
     *         )
     *     )
     * )
     */
    public function calculate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category' => 'required|string|in:spanduk,sticker,display,flyer,kartu_nama,buku,ncr,dokumen',
            'product_code' => 'required|string',
            'width_cm' => 'nullable|numeric|min:1',
            'height_cm' => 'nullable|numeric|min:1',
            'quantity' => 'required|integer|min:1',
            'pages' => 'nullable|integer|min:8|max:2000',
            'ply' => 'nullable|integer|in:2,3,4', // For NCR
            'size' => 'nullable|string|in:A3,A4,A5,A6,F4',
            'finishing' => 'nullable|array',
            'finishing.*' => 'string',
        ]);

        $category = $validated['category'];
        $productCode = $validated['product_code'];
        $widthCm = $validated['width_cm'] ?? null;
        $heightCm = $validated['height_cm'] ?? null;
        $quantity = $validated['quantity'];
        $pages = $validated['pages'] ?? 100;
        $size = $validated['size'] ?? 'A5';
        $finishing = $validated['finishing'] ?? [];

        // Convert cm to meters for area calculation
        $widthM = $widthCm ? $widthCm / 100 : 1;
        $heightM = $heightCm ? $heightCm / 100 : 1;
        $area = ($category === 'spanduk' || $category === 'sticker') ? $widthM * $heightM : 0;

        // Get base price
        $basePrice = self::PRODUCT_PRICES[$productCode] ?? 0;

        // Calculate billable quantity based on category
        $billableQty = $quantity;
        $unitPrice = $basePrice;
        
        if ($category === 'spanduk' || $category === 'sticker') {
            // Area-based: m² × quantity (min 1 m²)
            $billableQty = max($area, 1) * $quantity;
        } elseif ($category === 'flyer' || $category === 'kartu_nama') {
            // Volume-based: per 100 pcs
            $billableQty = ceil($quantity / 100) * 100;
        } elseif ($category === 'buku') {
            // Book: per 50 pcs, adjusted by pages
            $pageMultiplier = $pages / 100; // Base is 100 pages
            $billableQty = ceil($quantity / 50) * 50;
            $unitPrice = $basePrice * $pageMultiplier;
        }

        // Apply tier discount
        $discountPercent = 0;
        $tiers = self::QUANTITY_TIERS[$category] ?? [];
        foreach ($tiers as $tier) {
            if ($billableQty >= $tier['min']) {
                $discountPercent = $tier['discount'];
            }
        }

        // Calculate unit price with discount
        $unitPrice = $basePrice * (1 - $discountPercent / 100);

        // Calculate base total
        $baseTotal = $unitPrice * $billableQty;

        // Calculate finishing
        $finishingTotal = 0;
        $finishingBreakdown = [];
        foreach ($finishing as $finishingCode) {
            $finishingPrice = self::FINISHING_PRICES[$finishingCode] ?? 0;
            $finishingTotal += $finishingPrice;
            $finishingBreakdown[] = [
                'code' => $finishingCode,
                'name' => str_replace('_', ' ', strtoupper($finishingCode)),
                'price' => $finishingPrice,
            ];
        }

        // Grand total
        $grandTotal = $baseTotal + $finishingTotal;

        // Production time
        $productionTime = '2-3 hari';
        if ($category === 'spanduk') {
            $productionTime = '1-2 hari';
        } elseif ($category === 'buku') {
            $productionTime = (3 + (int)ceil($pages / 100)) . ' hari';
        }
        if ($quantity > 500) {
            $productionTime = ((int)$productionTime + 2) . ' hari';
        }

        // Build response
        $result = [
            'product' => [
                'code' => $productCode,
                'category' => $category,
                'name' => str_replace('_', ' ', strtoupper($productCode)),
            ],
            'specifications' => [
                'dimensions' => $category === 'spanduk' ? "{$widthM}m × {$heightM}m" : null,
                'area_m2' => $category === 'spanduk' ? round($area, 2) : null,
                'quantity' => $quantity,
                'billable_quantity' => round($billableQty, 2),
            ],
            'pricing' => [
                'base_price' => $basePrice,
                'discount_percent' => $discountPercent,
                'unit_price' => round($unitPrice, 2),
                'base_total' => round($baseTotal, 2),
                'finishing' => $finishingBreakdown,
                'finishing_total' => round($finishingTotal, 2),
                'grand_total' => round($grandTotal, 2),
            ],
            'production_time' => $productionTime,
            'breakdown' => [
                'productName' => str_replace('_', ' ', strtoupper($productCode)),
                'dimensions' => $category === 'spanduk' ? "{$widthM}m × {$heightM}m" : null,
                'area' => $category === 'spanduk' ? round($area, 2) : null,
                'quantity' => $quantity,
                'unitPrice' => round($unitPrice, 2),
                'subtotal' => round($baseTotal, 2),
                'finishing' => $finishingBreakdown,
                'finishingTotal' => round($finishingTotal, 2),
                'total' => round($grandTotal, 2),
                'productionTime' => $productionTime,
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $result,
        ]);
    }

    /**
     * Get available products and prices
     */
    public function getProducts(): JsonResponse
    {
        $products = [];
        foreach (self::PRODUCT_PRICES as $code => $price) {
            $category = str_contains($code, 'spanduk') ? 'spanduk'
                : (str_contains($code, 'sticker') ? 'sticker' : 'display');
            
            $products[] = [
                'code' => $code,
                'name' => str_replace('_', ' ', strtoupper($code)),
                'category' => $category,
                'price' => $price,
                'unit' => $category === 'display' ? 'unit' : 'm²',
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $products,
        ]);
    }

    /**
     * Get available finishing options
     */
    public function getFinishingOptions(): JsonResponse
    {
        $finishing = [];
        foreach (self::FINISHING_PRICES as $code => $price) {
            $finishing[] = [
                'code' => $code,
                'name' => str_replace('_', ' ', strtoupper($code)),
                'price' => $price,
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $finishing,
        ]);
    }
}
