<?php

namespace Database\Factories;

use App\Models\Book;
use App\Models\Marketplace;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Sale>
 */
class SaleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'marketplace_id' => Marketplace::factory(),
            'book_id' => Book::factory(),
            'transaction_id' => fake()->unique()->bothify('TRX-####-????'),
            'period_month' => now()->format('Y-m'),
            'quantity' => fake()->numberBetween(1, 100),
            'net_price' => fake()->randomFloat(2, 1000, 200000),
            'status' => 'completed',
        ];
    }
}
