<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    protected $model = Product::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'uuid' => $this->faker->uuid(),
            'sku' => $this->faker->unique()->bothify('PROD-####'),
            'name' => $this->faker->words(3, true),
            'description' => $this->faker->sentence(),
            'unit_price' => $this->faker->randomFloat(2, 10000, 1000000),
            'stock' => $this->faker->numberBetween(0, 1000),
            'stock_min' => 10,
            'created_by' => \App\Models\User::factory(),
        ];
    }
}
