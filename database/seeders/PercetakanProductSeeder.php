<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Seeds percetakan_products, price_tiers, and finishing_options
 * Based on Mahameru.id industry standards (Maret 2026 analysis)
 */
class PercetakanProductSeeder extends Seeder
{
    public function run(): void
    {
        // =================================================
        // PRODUCTS
        // =================================================
        $products = [
            // ── SPANDUK & BANNER ──
            [
                'code' => 'SPD-VINYL-FL',
                'name' => 'Spanduk Vinyl Frontlite',
                'category' => 'spanduk',
                'pricing_model' => 'area_based',
                'unit' => 'm2',
                'base_price' => 65000,
                'min_order_area' => 1,
                'min_order_qty' => 1,
                'description' => 'Banner vinyl outdoor tahan hujan dan sinar UV',
                'sort_order' => 1,
            ],
            [
                'code' => 'SPD-BACKDROP',
                'name' => 'Backdrop Portable',
                'category' => 'spanduk',
                'pricing_model' => 'area_based',
                'unit' => 'pcs',
                'base_price' => 750000,
                'min_order_area' => 1,
                'min_order_qty' => 1,
                'description' => 'Backdrop portable stand besi + cetak vinyl',
                'sort_order' => 2,
            ],
            [
                'code' => 'SPD-ROLLUP',
                'name' => 'Roll-Up Banner',
                'category' => 'spanduk',
                'pricing_model' => 'area_based',
                'unit' => 'pcs',
                'base_price' => 350000,
                'min_order_area' => 0.5,
                'min_order_qty' => 1,
                'description' => 'Banner roll-up 60-85cm termasuk mekanisme stand',
                'sort_order' => 3,
            ],
            [
                'code' => 'SPD-XBANNER',
                'name' => 'X-Banner',
                'category' => 'spanduk',
                'pricing_model' => 'area_based',
                'unit' => 'pcs',
                'base_price' => 120000,
                'min_order_area' => 0.5,
                'min_order_qty' => 1,
                'description' => 'X-Banner indoor stand + cetak',
                'sort_order' => 4,
            ],
            [
                'code' => 'SPD-KAIN',
                'name' => 'Spanduk Kain',
                'category' => 'spanduk',
                'pricing_model' => 'area_based',
                'unit' => 'm2',
                'base_price' => 85000,
                'min_order_area' => 1,
                'min_order_qty' => 1,
                'description' => 'Cetak spanduk kain, lebar max 140cm',
                'sort_order' => 5,
            ],

            // ── FLYER & BROSUR ──
            [
                'code' => 'FLY-A4',
                'name' => 'Brosur A4',
                'category' => 'flyer',
                'pricing_model' => 'volume_tier',
                'unit' => 'pcs',
                'base_price' => 2500,
                'min_order_qty' => 100,
                'default_paper' => 'Artpaper 150gsm',
                'default_gsm' => 150,
                'available_sizes' => json_encode(['A4']),
                'available_papers' => json_encode(['HVS 70gsm', 'HVS 100gsm', 'Artpaper 150gsm', 'Artpaper 260gsm']),
                'available_sides' => json_encode(['1_side', '2_sides']),
                'available_laminations' => json_encode(['none', 'matte', 'glossy']),
                'available_folds' => json_encode(['none', 'fold_2', 'fold_3']),
                'digital_max_qty' => 999,
                'offset_min_qty' => 1000,
                'description' => 'Cetak brosur ukuran A4 (21×30cm)',
                'sort_order' => 10,
            ],
            [
                'code' => 'FLY-A3',
                'name' => 'Brosur A3',
                'category' => 'flyer',
                'pricing_model' => 'volume_tier',
                'unit' => 'pcs',
                'base_price' => 5000,
                'min_order_qty' => 50,
                'default_paper' => 'Artpaper 150gsm',
                'default_gsm' => 150,
                'available_sizes' => json_encode(['A3']),
                'available_papers' => json_encode(['HVS 70gsm', 'Artpaper 150gsm', 'Artpaper 260gsm']),
                'available_sides' => json_encode(['1_side', '2_sides']),
                'available_laminations' => json_encode(['none', 'matte', 'glossy']),
                'available_folds' => json_encode(['none', 'fold_2', 'fold_3', 'fold_4', 'fold_6']),
                'digital_max_qty' => 499,
                'offset_min_qty' => 500,
                'description' => 'Cetak brosur ukuran A3 (29.7×42cm)',
                'sort_order' => 11,
            ],
            [
                'code' => 'FLY-A5',
                'name' => 'Flyer A5',
                'category' => 'flyer',
                'pricing_model' => 'volume_tier',
                'unit' => 'pcs',
                'base_price' => 1500,
                'min_order_qty' => 100,
                'default_paper' => 'Artpaper 150gsm',
                'default_gsm' => 150,
                'available_sizes' => json_encode(['A5']),
                'available_papers' => json_encode(['HVS 80gsm', 'Artpaper 150gsm', 'Artpaper 260gsm']),
                'available_sides' => json_encode(['1_side', '2_sides']),
                'available_laminations' => json_encode(['none', 'matte', 'glossy']),
                'available_folds' => json_encode(['none', 'fold_2']),
                'digital_max_qty' => 999,
                'offset_min_qty' => 1000,
                'sort_order' => 12,
            ],

            // ── BUKU ──
            [
                'code' => 'BK-SC',
                'name' => 'Buku Softcover',
                'category' => 'buku',
                'pricing_model' => 'per_page',
                'unit' => 'pcs',
                'base_price' => 15000, // cover cost
                'min_order_qty' => 25,
                'default_paper' => 'HVS 70gsm',
                'default_gsm' => 70,
                'available_sizes' => json_encode(['A4', 'A5', 'A6', 'DL']),
                'available_papers' => json_encode(['HVS 70gsm', 'HVS 80gsm', 'Artpaper 100gsm']),
                'available_colors' => json_encode(['fullcolor', 'bw']),
                'available_bindings' => json_encode(['perfect', 'saddle_stitch']),
                'cover_paper' => 'Artpaper 260gsm',
                'min_pages' => 50,
                'max_pages' => 500,
                'offset_min_qty' => 100,
                'description' => 'Buku softcover/paperback, Perfect Binding (Hot Glue)',
                'sort_order' => 20,
            ],
            [
                'code' => 'BK-HC',
                'name' => 'Buku Hardcover',
                'category' => 'buku',
                'pricing_model' => 'per_page',
                'unit' => 'pcs',
                'base_price' => 45000, // cover cost (lebih mahal)
                'min_order_qty' => 25,
                'default_paper' => 'HVS 80gsm',
                'default_gsm' => 80,
                'available_sizes' => json_encode(['A4', 'A5']),
                'available_papers' => json_encode(['HVS 70gsm', 'HVS 80gsm', 'Artpaper 100gsm']),
                'available_colors' => json_encode(['fullcolor', 'bw']),
                'available_bindings' => json_encode(['perfect']),
                'cover_paper' => 'Board 2mm + Artpaper 260gsm',
                'min_pages' => 50,
                'max_pages' => 500,
                'offset_min_qty' => 100,
                'description' => 'Buku hardcover premium dengan board 2mm',
                'sort_order' => 21,
            ],
            [
                'code' => 'BK-BOOKLET',
                'name' => 'Booklet / Majalah',
                'category' => 'buku',
                'pricing_model' => 'per_page',
                'unit' => 'pcs',
                'base_price' => 8000,
                'min_order_qty' => 50,
                'default_paper' => 'Artpaper 150gsm',
                'default_gsm' => 150,
                'available_sizes' => json_encode(['A4', 'A5']),
                'available_papers' => json_encode(['Artpaper 100gsm', 'Artpaper 150gsm']),
                'available_colors' => json_encode(['fullcolor']),
                'available_bindings' => json_encode(['saddle_stitch']),
                'cover_paper' => 'Artpaper 260gsm',
                'min_pages' => 8,
                'max_pages' => 40,
                'sort_order' => 22,
            ],

            // ── KARTU ──
            [
                'code' => 'KRT-NAMA',
                'name' => 'Kartu Nama',
                'category' => 'kartu',
                'pricing_model' => 'volume_tier',
                'unit' => 'box',
                'base_price' => 85000, // per box (100pcs)
                'min_order_qty' => 2,
                'default_paper' => 'Artcarton 260gsm',
                'available_sides' => json_encode(['1_side', '2_sides']),
                'available_laminations' => json_encode(['none', 'matte', 'glossy']),
                'available_finishings' => json_encode(['hotprint', 'emboss', 'rounded']),
                'description' => 'Kartu nama 1 box = 100 lembar. Min 2 box per nama.',
                'sort_order' => 30,
            ],

            // ── STICKER & LABEL ──
            [
                'code' => 'STK-CHROMO',
                'name' => 'Stiker Chromo (Kertas)',
                'category' => 'sticker',
                'pricing_model' => 'fixed_size',
                'unit' => 'lembar',
                'base_price' => 15000, // per lembar A3+
                'min_order_qty' => 1,
                'available_finishings' => json_encode(['die_cut']),
                'description' => 'Stiker bahan kertas chromo, per lembar A3+ (31×47cm)',
                'sort_order' => 40,
            ],
            [
                'code' => 'STK-VINYL',
                'name' => 'Stiker Vinyl',
                'category' => 'sticker',
                'pricing_model' => 'fixed_size',
                'unit' => 'lembar',
                'base_price' => 35000,
                'min_order_qty' => 1,
                'available_finishings' => json_encode(['die_cut']),
                'description' => 'Stiker vinyl tahan air, per lembar A3+ (31×47cm)',
                'sort_order' => 41,
            ],
            [
                'code' => 'STK-TRANSPARAN',
                'name' => 'Stiker Transparan',
                'category' => 'sticker',
                'pricing_model' => 'fixed_size',
                'unit' => 'lembar',
                'base_price' => 40000,
                'min_order_qty' => 1,
                'available_finishings' => json_encode(['die_cut']),
                'description' => 'Stiker vinyl transparan, per lembar A3+',
                'sort_order' => 42,
            ],
        ];

        foreach ($products as $p) {
            DB::table('percetakan_products')->updateOrInsert(
                ['code' => $p['code']],
                array_merge($p, ['created_at' => now(), 'updated_at' => now()])
            );
        }

        // =================================================
        // PRICE TIERS — Brosur A4
        // =================================================
        $brosurA4Id = DB::table('percetakan_products')->where('code', 'FLY-A4')->value('id');
        if ($brosurA4Id) {
            $tiers = [
                ['min_qty' => 100,  'max_qty' => 499,  'price_per_unit' => 2500, 'discount_percent' => 0,  'print_method' => 'digital'],
                ['min_qty' => 500,  'max_qty' => 999,  'price_per_unit' => 2500, 'discount_percent' => 10, 'print_method' => 'digital'],
                ['min_qty' => 1000, 'max_qty' => 1999, 'price_per_unit' => 2500, 'discount_percent' => 15, 'print_method' => 'offset'],
                ['min_qty' => 2000, 'max_qty' => 3999, 'price_per_unit' => 2500, 'discount_percent' => 20, 'print_method' => 'offset'],
                ['min_qty' => 4000, 'max_qty' => 5999, 'price_per_unit' => 2500, 'discount_percent' => 25, 'print_method' => 'offset'],
                ['min_qty' => 6000, 'max_qty' => null,  'price_per_unit' => 2500, 'discount_percent' => 30, 'print_method' => 'offset'],
            ];
            foreach ($tiers as $t) {
                DB::table('percetakan_price_tiers')->updateOrInsert(
                    ['product_id' => $brosurA4Id, 'min_qty' => $t['min_qty']],
                    array_merge($t, ['product_id' => $brosurA4Id, 'created_at' => now(), 'updated_at' => now()])
                );
            }
        }

        // Price Tiers — Brosur A3
        $brosurA3Id = DB::table('percetakan_products')->where('code', 'FLY-A3')->value('id');
        if ($brosurA3Id) {
            $tiers = [
                ['min_qty' => 50,   'max_qty' => 249,  'price_per_unit' => 5000, 'discount_percent' => 0,  'print_method' => 'digital'],
                ['min_qty' => 250,  'max_qty' => 499,  'price_per_unit' => 5000, 'discount_percent' => 10, 'print_method' => 'digital'],
                ['min_qty' => 500,  'max_qty' => 999,  'price_per_unit' => 5000, 'discount_percent' => 15, 'print_method' => 'offset'],
                ['min_qty' => 1000, 'max_qty' => 1999, 'price_per_unit' => 5000, 'discount_percent' => 20, 'print_method' => 'offset'],
                ['min_qty' => 2000, 'max_qty' => 2999, 'price_per_unit' => 5000, 'discount_percent' => 25, 'print_method' => 'offset'],
                ['min_qty' => 3000, 'max_qty' => null,  'price_per_unit' => 5000, 'discount_percent' => 30, 'print_method' => 'offset'],
            ];
            foreach ($tiers as $t) {
                DB::table('percetakan_price_tiers')->updateOrInsert(
                    ['product_id' => $brosurA3Id, 'min_qty' => $t['min_qty']],
                    array_merge($t, ['product_id' => $brosurA3Id, 'created_at' => now(), 'updated_at' => now()])
                );
            }
        }

        // Price Tiers — Buku Softcover per Ukuran
        $bukuScId = DB::table('percetakan_products')->where('code', 'BK-SC')->value('id');
        if ($bukuScId) {
            $bookTiers = [
                // A4
                ['size' => 'A4', 'min_qty' => 100, 'max_qty' => 299,  'discount_percent' => 20],
                ['size' => 'A4', 'min_qty' => 300, 'max_qty' => 499,  'discount_percent' => 30],
                ['size' => 'A4', 'min_qty' => 500, 'max_qty' => null,  'discount_percent' => 40],
                // A5
                ['size' => 'A5', 'min_qty' => 200, 'max_qty' => 499,  'discount_percent' => 20],
                ['size' => 'A5', 'min_qty' => 500, 'max_qty' => 999,  'discount_percent' => 30],
                ['size' => 'A5', 'min_qty' => 1000, 'max_qty' => null, 'discount_percent' => 40],
                // DL
                ['size' => 'DL', 'min_qty' => 400, 'max_qty' => 599,  'discount_percent' => 20],
                ['size' => 'DL', 'min_qty' => 600, 'max_qty' => 1499, 'discount_percent' => 30],
                ['size' => 'DL', 'min_qty' => 1500, 'max_qty' => null, 'discount_percent' => 40],
                // A6
                ['size' => 'A6', 'min_qty' => 400, 'max_qty' => 999,  'discount_percent' => 20],
                ['size' => 'A6', 'min_qty' => 1000, 'max_qty' => 1999, 'discount_percent' => 30],
                ['size' => 'A6', 'min_qty' => 2000, 'max_qty' => null,  'discount_percent' => 40],
            ];
            foreach ($bookTiers as $t) {
                DB::table('percetakan_price_tiers')->updateOrInsert(
                    ['product_id' => $bukuScId, 'size' => $t['size'], 'min_qty' => $t['min_qty']],
                    array_merge($t, ['product_id' => $bukuScId, 'price_per_unit' => 0, 'print_method' => 'offset', 'created_at' => now(), 'updated_at' => now()])
                );
            }
        }

        // Price Tiers — Kartu Nama
        $kartuId = DB::table('percetakan_products')->where('code', 'KRT-NAMA')->value('id');
        if ($kartuId) {
            $tiers = [
                ['min_qty' => 2,  'max_qty' => 9,   'price_per_unit' => 85000, 'discount_percent' => 0],
                ['min_qty' => 10, 'max_qty' => 14,  'price_per_unit' => 85000, 'discount_percent' => 10],
                ['min_qty' => 15, 'max_qty' => 19,  'price_per_unit' => 85000, 'discount_percent' => 15],
                ['min_qty' => 20, 'max_qty' => null, 'price_per_unit' => 85000, 'discount_percent' => 20],
            ];
            foreach ($tiers as $t) {
                DB::table('percetakan_price_tiers')->updateOrInsert(
                    ['product_id' => $kartuId, 'min_qty' => $t['min_qty']],
                    array_merge($t, ['product_id' => $kartuId, 'print_method' => 'digital', 'created_at' => now(), 'updated_at' => now()])
                );
            }
        }

        // =================================================
        // FINISHING OPTIONS
        // =================================================
        $finishings = [
            // Lamination
            ['code' => 'LAM_MATTE',   'name' => 'Laminasi Matte',   'category' => 'lamination', 'pricing_type' => 'per_unit', 'price' => 300],
            ['code' => 'LAM_GLOSSY',  'name' => 'Laminasi Glossy',  'category' => 'lamination', 'pricing_type' => 'per_unit', 'price' => 300],
            ['code' => 'LAM_UV',      'name' => 'UV Varnish',       'category' => 'lamination', 'pricing_type' => 'per_unit', 'price' => 500],

            // Folding
            ['code' => 'FOLD_2', 'name' => 'Lipat 2 (Half Fold)',  'category' => 'folding', 'pricing_type' => 'per_unit', 'price' => 150],
            ['code' => 'FOLD_3', 'name' => 'Lipat 3 (Tri-Fold)',   'category' => 'folding', 'pricing_type' => 'per_unit', 'price' => 200],
            ['code' => 'FOLD_4', 'name' => 'Lipat 4 (Cross Fold)', 'category' => 'folding', 'pricing_type' => 'per_unit', 'price' => 250],
            ['code' => 'FOLD_6', 'name' => 'Lipat 6 (Accordion)',  'category' => 'folding', 'pricing_type' => 'per_unit', 'price' => 350],

            // Premium Finishing
            ['code' => 'HOTPRINT',        'name' => 'Hotprint (Gold/Silver)', 'category' => 'finishing', 'pricing_type' => 'per_unit', 'price' => 2000],
            ['code' => 'EMBOSS',          'name' => 'Emboss',                 'category' => 'finishing', 'pricing_type' => 'per_unit', 'price' => 1500],
            ['code' => 'ROUNDED_CORNERS', 'name' => 'Rounded Corners',        'category' => 'finishing', 'pricing_type' => 'per_unit', 'price' => 500],
            ['code' => 'DIE_CUT',         'name' => 'Die Cut (Custom Shape)',  'category' => 'finishing', 'pricing_type' => 'per_unit', 'price' => 3000],

            // Spanduk Finishing
            ['code' => 'MATA_AYAM',  'name' => 'Mata Ayam (Eyelet)',     'category' => 'finishing', 'pricing_type' => 'flat_fee', 'price' => 5000],
            ['code' => 'LIPAT_TEPI', 'name' => 'Lipat Tepi (Hem)',       'category' => 'finishing', 'pricing_type' => 'flat_fee', 'price' => 10000],
            ['code' => 'SLONGSONG',  'name' => 'Selongsong (Pocket)',     'category' => 'finishing', 'pricing_type' => 'flat_fee', 'price' => 15000],
        ];

        foreach ($finishings as $f) {
            DB::table('percetakan_finishing_options')->updateOrInsert(
                ['code' => $f['code']],
                array_merge($f, ['is_active' => true, 'sort_order' => 0, 'created_at' => now(), 'updated_at' => now()])
            );
        }
    }
}
