<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Accounting\Journal>
 */
class JournalFactory extends Factory
{
    protected $model = \App\Models\Accounting\Journal::class;

    public function definition(): array
    {
        return [
            'journal_number' => 'JNL-' . fake()->unique()->numerify('########'),
            'date' => fake()->date(),
            'reference' => fake()->optional()->numerify('REF-#####'),
            'description' => fake()->sentence(),
            'total_amount' => fake()->numberBetween(100000, 50000000),
            'status' => 'draft',
            'created_by' => User::inRandomOrder()->first()?->id ?? User::factory(),
        ];
    }

    public function posted(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'posted',
        ]);
    }

    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'draft',
        ]);
    }

    public function withTotalAmount(int $amount): static
    {
        return $this->state(fn (array $attributes) => [
            'total_amount' => $amount,
        ]);
    }
}
