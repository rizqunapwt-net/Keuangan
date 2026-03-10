<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $adminId = \App\Models\User::first()?->id;

        $products = [
            [
                'name' => 'Rizquna ERP Guidebook',
                'sku' => 'BOOK-001',
                'barcode' => '9786021234567',
                'description' => 'Panduan lengkap penggunaan ERP Rizquna.',
                'unit_price' => 75000,
                'stock' => 100,
                'category' => 'Buku',
                'unit' => 'pcs',
            ],
            [
                'name' => 'Kertas A4 70gr',
                'sku' => 'PAPER-A4-70',
                'barcode' => '8991234567890',
                'description' => 'Kertas fotokopi premium A4.',
                'unit_price' => 45000,
                'stock' => 500,
                'category' => 'ATK',
                'unit' => 'rim',
            ],
            [
                'name' => 'Pulpen Pilot G2 0.5',
                'sku' => 'PEN-G2-05',
                'barcode' => '4902505163124',
                'description' => 'Pulpen gel hitam Pilot G2.',
                'unit_price' => 15000,
                'stock' => 240,
                'category' => 'ATK',
                'unit' => 'pcs',
            ],
            [
                'name' => 'Toner Printer HP 85A',
                'sku' => 'HP-85A-CE285A',
                'barcode' => '0884420587214',
                'description' => 'Toner printer LaserJet HP 85A.',
                'unit_price' => 850000,
                'stock' => 20,
                'category' => 'Perlengkapan Kantor',
                'unit' => 'pcs',
            ],
        ];

        foreach ($products as $p) {
            $data = $p;
            $stock = $data['stock'];
            unset($data['stock']);
            
            Product::updateOrCreate(
                ['sku' => $data['sku']],
                array_merge($data, [
                    'uuid' => (string) Str::uuid(),
                    'product_code' => $data['sku'],
                    'quantity_on_hand' => $stock,
                    'stock_min' => 5,
                    'status' => 'active',
                    'created_by' => $adminId,
                ])
            );
        }
    }
}
