<?php

namespace Database\Factories;

use App\Models\Book;
use App\Models\RoyaltyCalculation;
use App\Models\Sale;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\RoyaltyItem>
 */
class RoyaltyItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'royalty_calculation_id' => RoyaltyCalculation::factory(),
            'sale_id' => Sale::factory(),
            'book_id' => Book::factory(),
            'quantity' => fake()->numberBetween(1, 10),
            'net_price' => fake()->randomFloat(2, 1000, 100000),
            'royalty_percentage' => fake()->randomFloat(2, 5, 20),
            'amount' => fake()->randomFloat(2, 1000, 100000),
        ];
    }
}
