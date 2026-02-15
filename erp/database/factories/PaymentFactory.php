<?php

namespace Database\Factories;

use App\Models\RoyaltyCalculation;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Payment>
 */
class PaymentFactory extends Factory
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
            'invoice_number' => fake()->unique()->bothify('INV-RYL-######-####'),
            'amount' => fake()->randomFloat(2, 10000, 1000000),
            'status' => 'unpaid',
        ];
    }
}
