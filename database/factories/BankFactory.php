<?php

namespace Database\Factories;

use App\Enums\BankStatus;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Bank>
 */
class BankFactory extends Factory
{
    public function definition(): array
    {
        $openingBalance = fake()->numberBetween(1000000, 100000000);

        return [
            'bank_code' => strtoupper(fake()->unique()->lexify('???')) . '-' . date('YmdHis'),
            'bank_name' => fake()->randomElement(['BCA', 'Mandiri', 'BNI', 'CIMB Niaga', 'Permata Bank']),
            'branch_name' => fake()->city(),
            'account_number' => fake()->unique()->numerify('##############'),
            'account_holder' => fake()->name(),
            'account_type' => fake()->randomElement(['Giro', 'Tabungan']),
            'currency' => 'IDR',
            'opening_balance' => $openingBalance,
            'balance' => $openingBalance,
            'opening_date' => fake()->date(),
            'manager_id' => User::inRandomOrder()->first()?->id ?? User::factory(),
            'status' => BankStatus::ACTIVE,
            'is_primary' => false,
            'notes' => fake()->optional()->sentence(),
            'metadata' => null,
        ];
    }

    public function primary(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_primary' => true,
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => BankStatus::INACTIVE,
        ]);
    }

    public function withBalance(int $balance): static
    {
        return $this->state(fn (array $attributes) => [
            'balance' => $balance,
        ]);
    }
}
