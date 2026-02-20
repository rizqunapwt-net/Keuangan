<?php

namespace Database\Factories;

use App\Models\Book;
use App\Models\Marketplace;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Assignment>
 */
class AssignmentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'book_id' => Book::factory(),
            'marketplace_id' => Marketplace::factory(),
            'product_url' => fake()->url(),
            'posting_status' => 'draft',
        ];
    }
}
