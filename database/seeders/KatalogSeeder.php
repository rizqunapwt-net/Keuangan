<?php

namespace Database\Seeders;

use App\Models\Author;
use App\Models\Book;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class KatalogSeeder extends Seeder
{
    public function run(): void
    {
        $jsonPath = database_path('seeders/katalog_data.json');

        if (!file_exists($jsonPath)) {
            $this->command->error("katalog_data.json not found at: {$jsonPath}");
            return;
        }

        $items = json_decode(file_get_contents($jsonPath), true);
        $this->command->info("Importing " . count($items) . " books from Katalog Rizquna...");

        $authorCache = []; // name => Author model
        $bookCount = 0;
        $authorCount = 0;

        foreach ($items as $item) {
            // --- Create or find Author ---
            $authorName = trim($item['author_name'] ?? '');
            if (empty($authorName)) {
                continue;
            }

            $authorKey = mb_strtolower($authorName);

            if (!isset($authorCache[$authorKey])) {
                $author = Author::where('name', $authorName)->first();

                if (!$author) {
                    $author = Author::create([
                        'name' => $authorName,
                        'phone' => $item['phone'] ?? null,
                        'status' => 'active',
                    ]);
                    $authorCount++;
                }
                elseif (empty($author->phone) && !empty($item['phone'])) {
                    // Update phone if previously empty
                    $author->update(['phone' => $item['phone']]);
                }

                $authorCache[$authorKey] = $author;
            }

            $author = $authorCache[$authorKey];

            // --- Create Book (skip if ISBN already exists) ---
            $isbn = trim($item['isbn'] ?? '');

            if (!empty($isbn) && Book::where('isbn', $isbn)->exists()) {
                continue; // Skip duplicate ISBN
            }

            $book = Book::create([
                'author_id' => $author->id,
                'title' => $item['title'],
                'isbn' => $isbn ?: null,
                'price' => $item['price'] ?? 0,
                'stock' => 0,
                'status' => 'published',
                'tracking_code' => 'NRE-' . strtoupper(Str::random(8)),
            ]);

            $bookCount++;
        }

        $this->command->info("✅ Import selesai: {$bookCount} buku, {$authorCount} penulis baru");
    }
}