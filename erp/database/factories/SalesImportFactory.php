<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SalesImport>
 */
class SalesImportFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'period_month' => now()->format('Y-m'),
            'marketplace_code' => 'shopee',
            'file_name' => 'sales.csv',
            'total_rows' => 0,
            'imported_rows' => 0,
            'failed_rows' => 0,
            'status' => 'processing',
        ];
    }
}
