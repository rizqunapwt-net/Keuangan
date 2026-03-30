<?php

namespace Database\Factories;

use App\Models\Bank;
use App\Models\CashTransaction;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CashTransaction>
 */
class CashTransactionFactory extends Factory
{
    protected $model = CashTransaction::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'type' => $this->faker->randomElement(['in', 'out']),
            'bank_id' => Bank::factory(),
            'date' => $this->faker->date(),
            'time' => $this->faker->time(),
            'amount' => $this->faker->randomFloat(2, 100, 1000000),
            'category' => $this->faker->word(),
            'description' => $this->faker->sentence(),
            'running_balance' => $this->faker->randomFloat(2, 1000, 10000000),
        ];
    }
}
