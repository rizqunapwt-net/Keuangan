<?php

namespace Database\Factories;

use App\Enums\ExpenseStatus;
use App\Models\User;
use App\Models\Accounting\Account;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Expense>
 */
class ExpenseFactory extends Factory
{
    public function definition(): array
    {
        return [
            'expense_code' => 'EXP-' . date('YmdHis') . '-' . fake()->numerify('####'),
            'account_id' => Account::whereType('expense')->inRandomOrder()->first()?->id ?? Account::factory(),
            'user_id' => User::inRandomOrder()->first()?->id ?? User::factory(),
            'description' => fake()->sentence(),
            'category' => fake()->randomElement(['Supplies', 'Travel', 'Utilities', 'Maintenance', 'Other']),
            'amount' => fake()->numberBetween(100000, 50000000),
            'currency' => 'IDR',
            'expense_date' => fake()->date(),
            'payment_method' => fake()->randomElement(['Cash', 'Bank Transfer', 'Credit Card']),
            'reference_number' => fake()->optional()->numerify('REF-########'),
            'notes' => fake()->optional()->sentence(),
            'status' => ExpenseStatus::PENDING,
            'approved_by' => null,
            'approved_at' => null,
            'voided_by' => null,
            'voided_at' => null,
            'void_reason' => null,
            'attachment_path' => null,
            'metadata' => null,
        ];
    }

    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ExpenseStatus::APPROVED,
            'approved_by' => User::inRandomOrder()->first()?->id ?? User::factory(),
            'approved_at' => now(),
        ]);
    }

    public function voided(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ExpenseStatus::VOIDED,
            'voided_by' => User::inRandomOrder()->first()?->id ?? User::factory(),
            'voided_at' => now(),
            'void_reason' => fake()->sentence(),
        ]);
    }

    public function withAmount(int $amount): static
    {
        return $this->state(fn (array $attributes) => [
            'amount' => $amount,
        ]);
    }
}
