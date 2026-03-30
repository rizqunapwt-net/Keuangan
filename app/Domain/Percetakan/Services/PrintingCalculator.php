<?php

namespace App\Domain\Percetakan\Services;

use InvalidArgumentException;

class PrintingCalculator
{
    private const SIZE_AREAS = [
        'A3' => 0.12474,
        'A4' => 0.06237,
        'A5' => 0.031185,
        'A6' => 0.0155925,
        'DL' => 0.02079,
    ];

    private const SIZE_FACTORS = [
        'A3' => 2.00,
        'A4' => 1.00,
        'A5' => 0.60,
        'A6' => 0.35,
        'DL' => 0.40,
    ];

    private const BROSUR_PROFILES = [
        'LEGACY' => [
            'label' => 'Brosur A4',
            'base_price' => 2500.0,
            'tiers' => [
                ['min' => 100, 'discount' => 10, 'method' => 'Digital'],
                ['min' => 1000, 'discount' => 20, 'method' => 'Offset'],
                ['min' => 5000, 'discount' => 30, 'method' => 'Offset'],
            ],
        ],
        'A4' => [
            'label' => 'Brosur A4',
            'base_price' => 2500.0,
            'tiers' => [
                ['min' => 500, 'discount' => 10, 'method' => 'Digital'],
                ['min' => 1000, 'discount' => 15, 'method' => 'Offset'],
                ['min' => 2000, 'discount' => 20, 'method' => 'Offset'],
                ['min' => 4000, 'discount' => 25, 'method' => 'Offset'],
            ],
        ],
        'A3' => [
            'label' => 'Brosur A3',
            'base_price' => 5000.0,
            'tiers' => [
                ['min' => 250, 'discount' => 10, 'method' => 'Digital'],
                ['min' => 500, 'discount' => 15, 'method' => 'Offset'],
                ['min' => 1000, 'discount' => 20, 'method' => 'Offset'],
            ],
        ],
        'A5' => [
            'label' => 'Flyer A5',
            'base_price' => 1500.0,
            'tiers' => [
                ['min' => 500, 'discount' => 10, 'method' => 'Digital'],
                ['min' => 1000, 'discount' => 15, 'method' => 'Offset'],
            ],
        ],
    ];

    private const PAPER_MULTIPLIERS = [
        'hvs_70gsm' => 0.92,
        'hvs_80gsm' => 0.96,
        'hvs_100gsm' => 1.05,
        'artpaper_100gsm' => 1.08,
        'artpaper_150gsm' => 1.20,
        'artpaper_260gsm' => 1.45,
        'artcarton_260gsm' => 1.40,
        'transparent' => 1.55,
    ];

    private const PAPER_LABELS = [
        'hvs_70gsm' => 'HVS 70gsm',
        'hvs_80gsm' => 'HVS 80gsm',
        'hvs_100gsm' => 'HVS 100gsm',
        'artpaper_100gsm' => 'Artpaper 100gsm',
        'artpaper_150gsm' => 'Artpaper 150gsm',
        'artpaper_260gsm' => 'Artpaper 260gsm',
        'artcarton_260gsm' => 'Artcarton 260gsm',
        'transparent' => 'Transparent',
    ];

    private const BROSUR_FINISHING_COSTS = [
        'laminasi_doff' => 200.0,
        'laminasi_glossy' => 180.0,
        'laminasi_soft_touch' => 350.0,
        'lipat_2' => 80.0,
        'lipat_3' => 120.0,
        'lipat_4' => 160.0,
        'lipat_6' => 220.0,
    ];

    private const SPANDUK_MATERIALS = [
        'vinyl' => [
            'label' => 'Spanduk Vinyl Frontlite',
            'price_per_m2' => 65000.0,
            'setup_fee' => 0.0,
            'min_area' => 1.0,
            'weight_per_m2' => 0.32,
            'print_method' => 'Digital Printing',
        ],
        'frontlite' => [
            'label' => 'Spanduk Vinyl Frontlite',
            'price_per_m2' => 65000.0,
            'setup_fee' => 0.0,
            'min_area' => 1.0,
            'weight_per_m2' => 0.32,
            'print_method' => 'Digital Printing',
        ],
        'backdrop_portable' => [
            'label' => 'Backdrop Portable',
            'price_per_m2' => 85000.0,
            'setup_fee' => 450000.0,
            'min_area' => 2.0,
            'weight_per_m2' => 0.45,
            'print_method' => 'Large Format + Assembly',
        ],
        'roll_up_banner' => [
            'label' => 'Roll-Up Banner',
            'price_per_m2' => 90000.0,
            'setup_fee' => 250000.0,
            'min_area' => 0.5,
            'weight_per_m2' => 0.30,
            'print_method' => 'Large Format + Stand',
        ],
        'x_banner' => [
            'label' => 'X-Banner',
            'price_per_m2' => 70000.0,
            'setup_fee' => 70000.0,
            'min_area' => 0.5,
            'weight_per_m2' => 0.28,
            'print_method' => 'Large Format + Stand',
        ],
        'kain' => [
            'label' => 'Spanduk Kain',
            'price_per_m2' => 85000.0,
            'setup_fee' => 0.0,
            'min_area' => 1.0,
            'weight_per_m2' => 0.22,
            'print_method' => 'Sublimation',
        ],
    ];

    private const SPANDUK_FINISHING_COSTS = [
        'mata_ayam' => 2000.0,
        'mata_ayam_logam' => 3000.0,
        'slongson' => 10000.0,
        'hemming' => 5000.0,
    ];

    private const SPANDUK_DISCOUNTS = [
        ['min' => 5, 'discount' => 5],
        ['min' => 10, 'discount' => 10],
        ['min' => 25, 'discount' => 15],
    ];

    private const BUKU_PAGE_COSTS = [
        'bw' => 22.0,
        'fullcolor' => 65.0,
    ];

    private const BUKU_COVER_COSTS = [
        'softcover' => 5500.0,
        'hardcover' => 18000.0,
        'booklet' => 3000.0,
    ];

    private const BUKU_BINDING_COSTS = [
        'perfect' => 2500.0,
        'saddle_stitch' => 900.0,
    ];

    private const BUKU_LAMINATION_COSTS = [
        'none' => 0.0,
        'glossy' => 900.0,
        'matte' => 1100.0,
        'soft_touch' => 1800.0,
    ];

    private const BUKU_DISCOUNTS = [
        ['min' => 50, 'discount' => 5],
        ['min' => 100, 'discount' => 10],
        ['min' => 250, 'discount' => 15],
        ['min' => 500, 'discount' => 20],
    ];

    private const PAPER_THICKNESS = [
        70 => 0.09,
        80 => 0.10,
        100 => 0.11,
        150 => 0.16,
        260 => 0.28,
    ];

    private const KARTU_NAMA_LAMINATION_COSTS = [
        'none' => 0.0,
        'glossy' => 30.0,
        'matte' => 35.0,
        'soft_touch' => 75.0,
    ];

    private const KARTU_NAMA_FINISHING_COSTS = [
        'hotprint' => 2000.0,
        'emboss' => 1500.0,
        'rounded' => 500.0,
    ];

    private const KARTU_NAMA_DISCOUNTS = [
        ['min' => 500, 'discount' => 5],
        ['min' => 1000, 'discount' => 10],
        ['min' => 2000, 'discount' => 15],
    ];

    private const STIKER_MATERIALS = [
        'chromo' => [
            'label' => 'Stiker Chromo',
            'price_per_sheet' => 15000.0,
            'weight_per_sheet' => 0.06,
        ],
        'vinyl' => [
            'label' => 'Stiker Vinyl',
            'price_per_sheet' => 35000.0,
            'weight_per_sheet' => 0.08,
        ],
        'transparent' => [
            'label' => 'Stiker Transparan',
            'price_per_sheet' => 40000.0,
            'weight_per_sheet' => 0.075,
        ],
    ];

    private const STIKER_CUT_COSTS = [
        'manual' => 0.0,
        'kiss_cut' => 2500.0,
        'die_cut' => 5000.0,
    ];

    private const STIKER_DISCOUNTS = [
        ['min' => 20, 'discount' => 5],
        ['min' => 50, 'discount' => 10],
        ['min' => 100, 'discount' => 15],
    ];

    public function calculateBrosur(
        int $quantity = 100,
        string $size = 'LEGACY',
        string $paperType = 'art_paper_150gsm',
        string $colorOption = 'color_2sided',
        array $finishingOptions = []
    ): array {
        $profileKey = $this->normalizeBrosurProfile($size);
        $profile = self::BROSUR_PROFILES[$profileKey];
        $displaySize = $profileKey === 'LEGACY' ? 'A4' : $profileKey;
        $paperKey = $this->normalizePaperType($paperType, 'artpaper_150gsm');
        $printSides = $this->normalizePrintSides($colorOption);
        $basePrice = $profile['base_price'] * $this->paperMultiplier($paperKey) * ($printSides === '2_sides' ? 1.18 : 1.0);
        $finishingPerUnit = $this->sumBrosurFinishing($finishingOptions);
        $priceBeforeDiscount = $basePrice + $finishingPerUnit;
        $discount = $this->resolveTierValue($quantity, $profile['tiers'], 'discount');
        $method = $this->resolveTierValue($quantity, $profile['tiers'], 'method') ?? 'Digital';
        $unitPrice = $priceBeforeDiscount * (1 - ($discount / 100));
        $total = $unitPrice * $quantity;
        $discountAmount = ($priceBeforeDiscount - $unitPrice) * $quantity;
        $paperGsm = $this->paperGsm($paperKey);
        $weightKg = round(($quantity * $this->sizeArea($displaySize) * $paperGsm) / 1000, 2);
        $productionTime = $method === 'Offset' ? 3 : 2;
        if ($quantity >= 4000) {
            $productionTime++;
        }

        return $this->composeResult(
            'brosur',
            [
                'quantity' => $quantity,
                'size' => $displaySize,
                'paper_type' => $this->paperLabel($paperKey),
                'color_option' => $printSides,
                'finishing_options' => array_values($this->normalizeBrosurFinishingList($finishingOptions)),
            ],
            [
                'base_price_per_unit' => round($basePrice, 2),
                'finishing_cost_per_unit' => round($finishingPerUnit, 2),
                'price_per_unit_before_discount' => round($priceBeforeDiscount, 2),
                'discount_percentage' => $discount,
                'discount_amount' => round($discountAmount, 2),
                'price_per_unit_after_discount' => round($unitPrice, 2),
                'subtotal' => round($priceBeforeDiscount * $quantity, 2),
                'finishing_total' => round($finishingPerUnit * $quantity, 2),
                'total' => round($total, 2),
            ],
            $productionTime,
            [
                'weight_kg' => $weightKg,
                'print_method' => $method,
            ],
        );
    }

    public function calculateSpanduk(
        float $width = 100,
        float $height = 200,
        int $quantity = 5,
        string $material = 'vinyl',
        array $finishingOptions = []
    ): array {
        $materialKey = $this->normalizeSpandukMaterial($material);
        $config = self::SPANDUK_MATERIALS[$materialKey];
        $areaPerPiece = round(($width / 100) * ($height / 100), 4);
        $billableArea = max($areaPerPiece, $config['min_area']);
        $basePricePerPiece = ($billableArea * $config['price_per_m2']) + $config['setup_fee'];
        $finishingPerPiece = $this->sumFinishing($finishingOptions, self::SPANDUK_FINISHING_COSTS);
        $priceBeforeDiscount = $basePricePerPiece + $finishingPerPiece;
        $discount = $this->resolveDiscount($quantity, self::SPANDUK_DISCOUNTS);
        $unitPrice = $priceBeforeDiscount * (1 - ($discount / 100));
        $total = $unitPrice * $quantity;
        $productionTime = 1;
        if ($quantity >= 10 || $billableArea > 3) {
            $productionTime++;
        }
        if ($quantity >= 25) {
            $productionTime++;
        }

        return $this->composeResult(
            'spanduk',
            [
                'width_cm' => round($width, 2),
                'height_cm' => round($height, 2),
                'area_m2' => round($areaPerPiece, 2),
                'material' => $materialKey,
                'quantity' => $quantity,
            ],
            [
                'base_price_per_unit' => round($basePricePerPiece, 2),
                'finishing_cost_per_unit' => round($finishingPerPiece, 2),
                'price_per_unit_before_discount' => round($priceBeforeDiscount, 2),
                'discount_percentage' => $discount,
                'discount_amount' => round(($priceBeforeDiscount - $unitPrice) * $quantity, 2),
                'price_per_unit_after_discount' => round($unitPrice, 2),
                'subtotal' => round($priceBeforeDiscount * $quantity, 2),
                'finishing_total' => round($finishingPerPiece * $quantity, 2),
                'total' => round($total, 2),
            ],
            $productionTime,
            [
                'area_m2' => round($areaPerPiece * $quantity, 2),
                'weight_kg' => round($areaPerPiece * $config['weight_per_m2'] * $quantity, 2),
                'print_method' => $config['print_method'],
            ],
        );
    }

    public function calculateBuku(
        int $quantity = 50,
        int $pages = 100,
        string $size = 'A5',
        string $coverType = 'softcover',
        string $paperType = 'hvs_70gsm',
        string $colorMode = 'bw',
        string $bindingType = 'perfect',
        string $lamination = 'matte'
    ): array {
        $sizeKey = $this->normalizeSize($size, 'A5');
        $coverKey = $this->normalizeBookCover($coverType);
        $paperKey = $this->normalizePaperType($paperType, 'hvs_70gsm');
        $colorKey = $this->normalizeColorMode($colorMode);
        $bindingKey = $coverKey === 'booklet' ? 'saddle_stitch' : $this->normalizeBinding($bindingType);
        $laminationKey = $this->normalizeLamination($lamination);
        $pageCost = self::BUKU_PAGE_COSTS[$colorKey] * $this->sizeFactor($sizeKey) * $this->paperMultiplier($paperKey);
        $coverCost = self::BUKU_COVER_COSTS[$coverKey] * $this->sizeFactor($sizeKey);
        $bindingCost = self::BUKU_BINDING_COSTS[$bindingKey] * ($coverKey === 'hardcover' ? 1.35 : 1.0);
        $laminationCost = self::BUKU_LAMINATION_COSTS[$laminationKey] * ($coverKey === 'hardcover' ? 1.4 : 1.0);
        $priceBeforeDiscount = ($pages * $pageCost) + $coverCost + $bindingCost + $laminationCost;
        $discount = $this->resolveDiscount($quantity, self::BUKU_DISCOUNTS);
        $unitPrice = $priceBeforeDiscount * (1 - ($discount / 100));
        $total = $unitPrice * $quantity;
        $sheetCount = (int) ceil($pages / 2);
        $paperGsm = $this->paperGsm($paperKey);
        $sizeArea = $this->sizeArea($sizeKey);
        $bodyWeight = ($sheetCount * $sizeArea * $paperGsm) / 1000;
        $coverWeight = $coverKey === 'hardcover'
            ? $sizeArea * 350 / 1000
            : ($coverKey === 'booklet' ? $sizeArea * 170 / 1000 : $sizeArea * 250 / 1000);
        $weightKg = round($bodyWeight + $coverWeight, 2);
        $thickness = self::PAPER_THICKNESS[$paperGsm] ?? 0.10;
        $spineWidth = round(($sheetCount * $thickness) + ($coverKey === 'hardcover' ? 2.0 : 0.0), 1);
        $productionTime = 3 + (int) ceil($pages / 100);
        if ($coverKey === 'hardcover') {
            $productionTime++;
        }
        if ($quantity >= 200) {
            $productionTime++;
        }
        $method = $quantity >= 100 ? 'Offset Sheetfed' : 'Digital Book Printing';

        return $this->composeResult(
            'buku',
            [
                'pages' => $pages,
                'size' => $sizeKey,
                'cover_type' => $coverKey,
                'quantity' => $quantity,
                'binding_type' => $bindingKey,
                'paper_type' => $this->paperLabel($paperKey),
                'color_mode' => $colorKey,
            ],
            [
                'base_price_per_unit' => round(($pages * $pageCost) + $coverCost + $bindingCost, 2),
                'finishing_cost_per_unit' => round($laminationCost, 2),
                'price_per_unit_before_discount' => round($priceBeforeDiscount, 2),
                'discount_percentage' => $discount,
                'discount_amount' => round(($priceBeforeDiscount - $unitPrice) * $quantity, 2),
                'price_per_unit_after_discount' => round($unitPrice, 2),
                'subtotal' => round($priceBeforeDiscount * $quantity, 2),
                'finishing_total' => round($laminationCost * $quantity, 2),
                'total' => round($total, 2),
            ],
            $productionTime,
            [
                'weight_kg' => $weightKg,
                'spine_width_mm' => $spineWidth,
                'page_count' => $pages,
                'print_method' => $method,
            ],
        );
    }

    public function calculateKartuNama(
        int $quantity = 200,
        string $printSides = '2_sides',
        string $lamination = 'matte',
        array $finishingOptions = []
    ): array {
        $sideKey = $this->normalizePrintSides($printSides);
        $laminationKey = $this->normalizeLamination($lamination);
        $basePrice = 325.0 * ($sideKey === '2_sides' ? 1.25 : 1.0);
        $laminationCost = self::KARTU_NAMA_LAMINATION_COSTS[$laminationKey] ?? 0.0;
        $finishingPerUnit = $this->sumFinishing($finishingOptions, self::KARTU_NAMA_FINISHING_COSTS);
        $priceBeforeDiscount = $basePrice + $laminationCost + $finishingPerUnit;
        $discount = $this->resolveDiscount($quantity, self::KARTU_NAMA_DISCOUNTS);
        $unitPrice = $priceBeforeDiscount * (1 - ($discount / 100));
        $total = $unitPrice * $quantity;
        $productionTime = $quantity > 1500 ? 3 : ($quantity > 500 ? 2 : 1);
        $weightKg = round(($quantity * 0.00495 * 260) / 1000, 2);
        $method = $quantity >= 1000 ? 'Offset + Finishing' : 'Digital Press';

        return $this->composeResult(
            'kartu_nama',
            [
                'quantity' => $quantity,
                'paper_type' => 'Artcarton 260gsm',
                'print_sides' => $sideKey,
                'lamination' => $laminationKey,
                'finishing_options' => array_values($this->normalizeSimpleList($finishingOptions)),
            ],
            [
                'base_price_per_unit' => round($basePrice, 2),
                'finishing_cost_per_unit' => round($laminationCost + $finishingPerUnit, 2),
                'price_per_unit_before_discount' => round($priceBeforeDiscount, 2),
                'discount_percentage' => $discount,
                'discount_amount' => round(($priceBeforeDiscount - $unitPrice) * $quantity, 2),
                'price_per_unit_after_discount' => round($unitPrice, 2),
                'subtotal' => round($priceBeforeDiscount * $quantity, 2),
                'finishing_total' => round(($laminationCost + $finishingPerUnit) * $quantity, 2),
                'total' => round($total, 2),
            ],
            $productionTime,
            [
                'finishing_fees' => round($finishingPerUnit * $quantity, 2),
                'weight_kg' => $weightKg,
                'print_method' => $method,
            ],
        );
    }

    public function calculateStiker(
        float $width = 5,
        float $height = 5,
        int $sheetCount = 10,
        string $material = 'chromo',
        string $cutType = 'die_cut'
    ): array {
        $materialKey = $this->normalizeStickerMaterial($material);
        $cutKey = $this->normalizeStickerCut($cutType);
        $config = self::STIKER_MATERIALS[$materialKey];
        $basePrice = $config['price_per_sheet'];
        $cutCost = self::STIKER_CUT_COSTS[$cutKey];
        $priceBeforeDiscount = $basePrice + $cutCost;
        $discount = $this->resolveDiscount($sheetCount, self::STIKER_DISCOUNTS);
        $unitPrice = $priceBeforeDiscount * (1 - ($discount / 100));
        $total = $unitPrice * $sheetCount;
        $productionTime = $sheetCount > 50 ? 2 : 1;

        return $this->composeResult(
            'stiker',
            [
                'width_cm' => round($width, 2),
                'height_cm' => round($height, 2),
                'sheet_count' => $sheetCount,
                'material' => $materialKey,
                'cut_type' => $cutKey,
            ],
            [
                'base_price_per_unit' => round($basePrice, 2),
                'finishing_cost_per_unit' => round($cutCost, 2),
                'price_per_unit_before_discount' => round($priceBeforeDiscount, 2),
                'discount_percentage' => $discount,
                'discount_amount' => round(($priceBeforeDiscount - $unitPrice) * $sheetCount, 2),
                'price_per_unit_after_discount' => round($unitPrice, 2),
                'subtotal' => round($priceBeforeDiscount * $sheetCount, 2),
                'finishing_total' => round($cutCost * $sheetCount, 2),
                'total' => round($total, 2),
            ],
            $productionTime,
            [
                'weight_kg' => round($config['weight_per_sheet'] * $sheetCount, 2),
                'print_method' => 'Eco Solvent Sticker Printing',
            ],
        );
    }

    public function quickCalculate(string $productType, array $customParams = []): array
    {
        $type = $this->normalizeToken($productType);

        return match ($type) {
            'brosur', 'flyer' => $this->calculateBrosur(
                quantity: (int) ($customParams['quantity'] ?? 100),
                size: (string) ($customParams['size'] ?? 'A4'),
                paperType: (string) ($customParams['paper_type'] ?? 'art_paper_150gsm'),
                colorOption: (string) ($customParams['color_option'] ?? $customParams['print_sides'] ?? '2_sides'),
                finishingOptions: $this->quickBrosurFinishing($customParams),
            ),
            'spanduk', 'banner_vinyl' => $this->calculateSpanduk(
                width: (float) ($customParams['width'] ?? $customParams['width_cm'] ?? 100),
                height: (float) ($customParams['height'] ?? $customParams['height_cm'] ?? 200),
                quantity: (int) ($customParams['quantity'] ?? 1),
                material: (string) ($customParams['material'] ?? $customParams['product_code'] ?? 'vinyl'),
                finishingOptions: (array) ($customParams['finishing'] ?? []),
            ),
            'buku', 'buku_softcover' => $this->calculateBuku(
                quantity: (int) ($customParams['quantity'] ?? 50),
                pages: (int) ($customParams['pages'] ?? $customParams['page_count'] ?? 100),
                size: (string) ($customParams['size'] ?? $customParams['paper_size'] ?? 'A5'),
                coverType: (string) ($customParams['cover_type'] ?? 'softcover'),
                paperType: (string) ($customParams['paper_type'] ?? 'hvs_70gsm'),
                colorMode: (string) ($customParams['color_mode'] ?? 'bw'),
                bindingType: (string) ($customParams['binding_type'] ?? 'perfect'),
                lamination: (string) ($customParams['lamination'] ?? 'matte'),
            ),
            'kartu_nama' => $this->calculateKartuNama(
                quantity: (int) ($customParams['quantity'] ?? 200),
                printSides: (string) ($customParams['print_sides'] ?? '2_sides'),
                lamination: (string) ($customParams['lamination'] ?? 'matte'),
                finishingOptions: (array) ($customParams['finishing'] ?? []),
            ),
            'stiker', 'sticker' => $this->calculateStiker(
                width: (float) ($customParams['width'] ?? $customParams['width_cm'] ?? 5),
                height: (float) ($customParams['height'] ?? $customParams['height_cm'] ?? 5),
                sheetCount: (int) ($customParams['sheet_count'] ?? $customParams['quantity'] ?? 10),
                material: (string) ($customParams['material'] ?? 'chromo'),
                cutType: (string) ($customParams['cut_type'] ?? 'die_cut'),
            ),
            default => throw new InvalidArgumentException('Jenis kalkulator tidak dikenali.'),
        };
    }

    public function calculate(array $payload): array
    {
        $type = $payload['category'] ?? $this->legacyTypeFromPayload($payload);

        return match ($type) {
            'brosur', 'flyer' => $this->calculateBrosur(
                quantity: (int) ($payload['quantity'] ?? 100),
                size: $this->legacyBrosurSize($payload),
                paperType: (string) ($payload['paper_type'] ?? 'art_paper_150gsm'),
                colorOption: (string) ($payload['color_option'] ?? $payload['print_sides'] ?? '2_sides'),
                finishingOptions: $this->quickBrosurFinishing($payload),
            ),
            'spanduk' => $this->calculateSpanduk(
                width: (float) ($payload['width'] ?? $payload['width_cm'] ?? 100),
                height: (float) ($payload['height'] ?? $payload['height_cm'] ?? 200),
                quantity: (int) ($payload['quantity'] ?? 1),
                material: $this->legacySpandukMaterial($payload),
                finishingOptions: (array) ($payload['finishing'] ?? []),
            ),
            'buku' => $this->calculateBuku(
                quantity: (int) ($payload['quantity'] ?? 50),
                pages: (int) ($payload['pages'] ?? $payload['page_count'] ?? 100),
                size: (string) ($payload['size'] ?? $payload['paper_size'] ?? 'A5'),
                coverType: $this->legacyBukuCover($payload),
                paperType: (string) ($payload['paper_type'] ?? 'hvs_70gsm'),
                colorMode: (string) ($payload['color_mode'] ?? 'bw'),
                bindingType: (string) ($payload['binding_type'] ?? 'perfect'),
                lamination: (string) ($payload['lamination'] ?? 'matte'),
            ),
            'kartu_nama' => $this->calculateKartuNama(
                quantity: (int) ($payload['quantity'] ?? 200),
                printSides: (string) ($payload['print_sides'] ?? '2_sides'),
                lamination: (string) ($payload['lamination'] ?? 'matte'),
                finishingOptions: (array) ($payload['finishing'] ?? []),
            ),
            'stiker', 'sticker' => $this->calculateStiker(
                width: (float) ($payload['width'] ?? $payload['width_cm'] ?? 5),
                height: (float) ($payload['height'] ?? $payload['height_cm'] ?? 5),
                sheetCount: (int) ($payload['sheet_count'] ?? $payload['quantity'] ?? 10),
                material: (string) ($payload['material'] ?? 'chromo'),
                cutType: (string) ($payload['cut_type'] ?? 'die_cut'),
            ),
            default => throw new InvalidArgumentException('Payload kalkulator tidak dikenali.'),
        };
    }

    public function getAvailableOptions(): array
    {
        return [
            'product_types' => ['brosur', 'banner_vinyl', 'buku_softcover', 'kartu_nama', 'stiker'],
            'paper_types' => array_values(self::PAPER_LABELS),
            'sizes' => ['A3', 'A4', 'A5', 'A6', 'DL'],
            'color_options' => ['1_side', '2_sides', 'bw', 'fullcolor'],
            'finishing_options' => [
                'laminasi_doff',
                'laminasi_glossy',
                'laminasi_soft_touch',
                'lipat_2',
                'lipat_3',
                'lipat_4',
                'lipat_6',
                'hotprint',
                'emboss',
                'rounded',
                'manual',
                'kiss_cut',
                'die_cut',
            ],
            'quantity_tiers' => [
                'brosur_a4' => self::BROSUR_PROFILES['A4']['tiers'],
                'spanduk' => self::SPANDUK_DISCOUNTS,
                'buku' => self::BUKU_DISCOUNTS,
                'kartu_nama' => self::KARTU_NAMA_DISCOUNTS,
                'stiker' => self::STIKER_DISCOUNTS,
            ],
        ];
    }

    private function composeResult(
        string $productType,
        array $specifications,
        array $pricing,
        int $productionTime,
        array $extra = []
    ): array {
        $quantity = (int) ($specifications['quantity'] ?? $specifications['sheet_count'] ?? 1);
        $finishingTotal = $pricing['finishing_total'] ?? (($pricing['finishing_cost_per_unit'] ?? 0) * $quantity);

        return array_merge([
            'product_type' => $productType,
            'specifications' => $specifications,
            'pricing' => $pricing,
            'production_time' => $productionTime,
            'unit_price' => round($pricing['price_per_unit_after_discount'] ?? 0, 2),
            'total_price' => round($pricing['total'] ?? 0, 2),
            'discount_percent' => (int) ($pricing['discount_percentage'] ?? 0),
            'estimated_days' => (string) $productionTime,
            'finishing_fees' => round($finishingTotal, 2),
        ], $extra);
    }

    private function resolveDiscount(int $quantity, array $tiers): int
    {
        return (int) ($this->resolveTierValue($quantity, $tiers, 'discount') ?? 0);
    }

    private function resolveTierValue(int $quantity, array $tiers, string $key): mixed
    {
        $value = null;
        foreach ($tiers as $tier) {
            if ($quantity >= $tier['min']) {
                $value = $tier[$key] ?? $value;
            }
        }

        return $value;
    }

    private function quickBrosurFinishing(array $payload): array
    {
        $finishing = array_values((array) ($payload['finishing_options'] ?? []));
        $lamination = $payload['lamination'] ?? null;
        $foldType = $payload['fold_type'] ?? null;

        if (is_string($lamination) && $this->normalizeToken($lamination) !== 'none') {
            $finishing[] = $lamination;
        }

        if (is_string($foldType) && $this->normalizeToken($foldType) !== 'none') {
            $finishing[] = $foldType;
        }

        return $finishing;
    }

    private function legacyTypeFromPayload(array $payload): string
    {
        $productId = (int) ($payload['product_id'] ?? 0);

        return match (true) {
            $productId >= 1 && $productId <= 5 => 'spanduk',
            $productId >= 6 && $productId <= 8 => 'brosur',
            $productId >= 9 && $productId <= 11 => 'buku',
            $productId === 12 => 'kartu_nama',
            $productId === 13 => 'stiker',
            default => $this->normalizeToken((string) ($payload['product_code'] ?? '')),
        };
    }

    private function legacyBrosurSize(array $payload): string
    {
        $productId = (int) ($payload['product_id'] ?? 0);

        return match ($productId) {
            7 => 'A3',
            8 => 'A5',
            default => (string) ($payload['size'] ?? 'A4'),
        };
    }

    private function legacySpandukMaterial(array $payload): string
    {
        if (!empty($payload['material'])) {
            return (string) $payload['material'];
        }

        return match ((int) ($payload['product_id'] ?? 0)) {
            2 => 'backdrop_portable',
            3 => 'roll_up_banner',
            4 => 'x_banner',
            5 => 'kain',
            default => 'vinyl',
        };
    }

    private function legacyBukuCover(array $payload): string
    {
        if (!empty($payload['cover_type'])) {
            return (string) $payload['cover_type'];
        }

        return match ((int) ($payload['product_id'] ?? 0)) {
            10 => 'hardcover',
            11 => 'booklet',
            default => 'softcover',
        };
    }

    private function sumBrosurFinishing(array $finishingOptions): float
    {
        $total = 0.0;

        foreach ($this->normalizeBrosurFinishingList($finishingOptions) as $finishing) {
            $total += self::BROSUR_FINISHING_COSTS[$finishing] ?? 0.0;
        }

        return $total;
    }

    private function normalizeBrosurFinishingList(array $finishingOptions): array
    {
        $normalized = [];

        foreach ($finishingOptions as $finishing) {
            $key = $this->normalizeToken((string) $finishing);
            $mapped = match ($key) {
                'matte', 'doff', 'laminasi_doff', 'laminasi_matte' => 'laminasi_doff',
                'glossy', 'laminasi_glossy' => 'laminasi_glossy',
                'soft_touch', 'laminasi_soft_touch', 'elegant' => 'laminasi_soft_touch',
                'fold_2', 'lipat_2' => 'lipat_2',
                'fold_3', 'lipat_3' => 'lipat_3',
                'fold_4', 'lipat_4' => 'lipat_4',
                'fold_6', 'lipat_6' => 'lipat_6',
                default => null,
            };

            if ($mapped !== null) {
                $normalized[] = $mapped;
            }
        }

        return array_values(array_unique($normalized));
    }

    private function sumFinishing(array $options, array $catalog): float
    {
        $total = 0.0;

        foreach ($this->normalizeSimpleList($options) as $option) {
            $total += $catalog[$option] ?? 0.0;
        }

        return $total;
    }

    private function normalizeSimpleList(array $options): array
    {
        return array_values(array_unique(array_map(
            fn (mixed $value): string => $this->normalizeToken((string) $value),
            $options,
        )));
    }

    private function normalizeToken(string $value): string
    {
        $value = strtolower(trim($value));
        $value = str_replace(['&', '/', '-', '(', ')'], [' ', ' ', '_', '', ''], $value);
        $value = preg_replace('/\s+/', '_', $value) ?? '';

        return preg_replace('/[^a-z0-9_]/', '', $value) ?? '';
    }

    private function normalizeBrosurProfile(string $size): string
    {
        $normalized = strtoupper($this->normalizeToken($size));

        return match ($normalized) {
            'A3' => 'A3',
            'A5', 'FLYER', 'DL' => 'A5',
            'LEGACY', '' => 'LEGACY',
            default => 'A4',
        };
    }

    private function normalizeSize(string $size, string $fallback): string
    {
        $normalized = strtoupper($this->normalizeToken($size));

        return array_key_exists($normalized, self::SIZE_AREAS) ? $normalized : $fallback;
    }

    private function normalizePaperType(string $paperType, string $fallback): string
    {
        $normalized = $this->normalizeToken($paperType);
        $mapped = match ($normalized) {
            'art_paper_100gsm', 'artpaper_100gsm' => 'artpaper_100gsm',
            'art_paper_150gsm', 'artpaper_150gsm' => 'artpaper_150gsm',
            'art_paper_260gsm', 'artpaper_260gsm' => 'artpaper_260gsm',
            'hvs_70gsm' => 'hvs_70gsm',
            'hvs_80gsm' => 'hvs_80gsm',
            'hvs_100gsm' => 'hvs_100gsm',
            'artcarton_260gsm', 'art_carton_260gsm' => 'artcarton_260gsm',
            'transparent', 'stiker_transparan' => 'transparent',
            default => null,
        };

        return $mapped ?? $fallback;
    }

    private function normalizePrintSides(string $printSides): string
    {
        return match ($this->normalizeToken($printSides)) {
            '1_side', '1_sides', 'color_1sided', 'single', 'single_side' => '1_side',
            default => '2_sides',
        };
    }

    private function normalizeBookCover(string $coverType): string
    {
        return match ($this->normalizeToken($coverType)) {
            'hardcover' => 'hardcover',
            'booklet', 'majalah' => 'booklet',
            default => 'softcover',
        };
    }

    private function normalizeColorMode(string $colorMode): string
    {
        return match ($this->normalizeToken($colorMode)) {
            'fullcolor', 'full_color', 'warna', 'colour' => 'fullcolor',
            default => 'bw',
        };
    }

    private function normalizeBinding(string $bindingType): string
    {
        return match ($this->normalizeToken($bindingType)) {
            'saddle_stitch', 'staples', 'staple' => 'saddle_stitch',
            default => 'perfect',
        };
    }

    private function normalizeLamination(string $lamination): string
    {
        return match ($this->normalizeToken($lamination)) {
            'glossy' => 'glossy',
            'soft_touch' => 'soft_touch',
            'none' => 'none',
            default => 'matte',
        };
    }

    private function normalizeSpandukMaterial(string $material): string
    {
        return match ($this->normalizeToken($material)) {
            'frontlite', 'vinyl', 'spanduk_vinyl_frontlite' => 'vinyl',
            'backdrop_portable', 'backdrop' => 'backdrop_portable',
            'roll_up_banner', 'rollup', 'roll_up' => 'roll_up_banner',
            'x_banner', 'xbanner' => 'x_banner',
            'kain', 'spanduk_kain' => 'kain',
            default => 'vinyl',
        };
    }

    private function normalizeStickerMaterial(string $material): string
    {
        return match ($this->normalizeToken($material)) {
            'vinyl', 'stiker_vinyl', 'sticker_vinyl' => 'vinyl',
            'transparent', 'transparan', 'stiker_transparan' => 'transparent',
            default => 'chromo',
        };
    }

    private function normalizeStickerCut(string $cutType): string
    {
        return match ($this->normalizeToken($cutType)) {
            'manual' => 'manual',
            'kiss_cut' => 'kiss_cut',
            default => 'die_cut',
        };
    }

    private function sizeArea(string $size): float
    {
        return self::SIZE_AREAS[$size] ?? self::SIZE_AREAS['A4'];
    }

    private function sizeFactor(string $size): float
    {
        return self::SIZE_FACTORS[$size] ?? 1.0;
    }

    private function paperMultiplier(string $paperKey): float
    {
        return self::PAPER_MULTIPLIERS[$paperKey] ?? 1.0;
    }

    private function paperLabel(string $paperKey): string
    {
        return self::PAPER_LABELS[$paperKey] ?? strtoupper(str_replace('_', ' ', $paperKey));
    }

    private function paperGsm(string $paperKey): int
    {
        if (preg_match('/(\d+)gsm/', $paperKey, $matches) === 1) {
            return (int) $matches[1];
        }

        return 80;
    }
}
