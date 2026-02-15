<?php

namespace Database\Factories;

use App\Models\Author;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\RoyaltyCalculation>
 */
class RoyaltyCalculationFactory extends Factory
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
            'author_id' => Author::factory(),
            'total_amount' => fake()->randomFloat(2, 0, 1000000),
            'status' => 'draft',
            'calculated_at' => now(),
        ];
    }
}
