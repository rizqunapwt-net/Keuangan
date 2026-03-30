<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Accounting\Account>
 */
class AccountFactory extends Factory
{
    protected $model = \App\Models\Accounting\Account::class;

    public function definition(): array
    {
        $type = fake()->randomElement(['asset', 'liability', 'equity', 'revenue', 'expense']);

        return [
            'code' => fake()->unique()->numerify('ACC-####'),
            'name' => fake()->word().' '.ucfirst($type),
            'type' => $type,
            'description' => fake()->optional()->sentence(),
            'is_active' => true,
        ];
    }

    public function asset(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'asset',
            'name' => fake()->word().' Asset',
        ]);
    }

    public function liability(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'liability',
            'name' => fake()->word().' Liability',
        ]);
    }

    public function equity(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'equity',
            'name' => fake()->word().' Equity',
        ]);
    }

    public function revenue(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'revenue',
            'name' => fake()->word().' Revenue',
        ]);
    }

    public function expense(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'expense',
            'name' => fake()->word().' Expense',
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
