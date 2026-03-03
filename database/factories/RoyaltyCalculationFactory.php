<?php

namespace Database\Factories;

use App\Models\Author;
use App\Models\RoyaltyCalculation;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RoyaltyCalculation>
 */
class RoyaltyCalculationFactory extends Factory
{
    protected $model = RoyaltyCalculation::class;

    public function definition(): array
    {
        return [
            'period_month' => now()->format('Y-m'),
            'author_id' => Author::factory(),
            'total_amount' => fake()->randomFloat(2, 10000, 2000000),
            'status' => 'draft',
            'finalized_by' => null,
            'finalized_at' => null,
        ];
    }
}
