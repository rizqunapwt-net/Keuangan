<?php

namespace Database\Factories;

use App\Models\Accounting\Journal;
use App\Models\Accounting\Account;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Accounting\JournalEntry>
 */
class JournalEntryFactory extends Factory
{
    protected $model = \App\Models\Accounting\JournalEntry::class;

    public function definition(): array
    {
        return [
            'journal_id' => Journal::inRandomOrder()->first()?->id ?? Journal::factory(),
            'account_id' => Account::inRandomOrder()->first()?->id ?? Account::factory(),
            'type' => fake()->randomElement(['debit', 'credit']),
            'amount' => fake()->numberBetween(100000, 50000000),
            'memo' => fake()->optional()->sentence(),
        ];
    }

    public function debit(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'debit',
        ]);
    }

    public function credit(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'credit',
        ]);
    }

    public function withAmount(int $amount): static
    {
        return $this->state(fn (array $attributes) => [
            'amount' => $amount,
        ]);
    }
}
