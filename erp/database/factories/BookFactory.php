<?php

namespace Database\Factories;

use App\Models\Author;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Book>
 */
class BookFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'author_id' => Author::factory(),
            'title' => fake()->sentence(3),
            'isbn' => fake()->unique()->numerify('978##########'),
            'description' => fake()->paragraph(),
            'price' => fake()->randomFloat(2, 10000, 200000),
            'status' => 'draft',
        ];
    }
}
