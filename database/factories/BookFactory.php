<?php

namespace Database\Factories;

use App\Models\Author;
use App\Models\Book;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class BookFactory extends Factory
{
    protected $model = Book::class;

    public function definition(): array
    {
        return [
            'type' => 'publishing',
            'author_id' => Author::factory(),
            'title' => $title = $this->faker->sentence(3),
            'slug' => Str::slug($title),
            'isbn' => $this->faker->isbn13(),
            'price' => $this->faker->randomFloat(2, 50000, 150000),
            'stock' => $this->faker->numberBetween(0, 1000),
            'status' => 'published',
            'is_published' => true,
            'is_digital' => true,
            'published_at' => now(),
            'page_count' => $this->faker->numberBetween(100, 500),
            'size' => 'A5',
            'published_year' => now()->year,
            'publisher' => 'Rizquna Elfath',
            'publisher_city' => 'Cirebon',
            'description' => $this->faker->paragraph(),
            'tracking_code' => 'NRE-'.strtoupper(Str::random(8)),
        ];
    }
}
