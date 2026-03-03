<?php

namespace Database\Seeders;

use App\Enums\BookStatus;
use App\Models\Author;
use App\Models\Book;
use App\Models\Contract;
use Illuminate\Database\Seeder;

class BusinessDataSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Authors
        $authors = [
            ['name' => 'Ahmad Rizky', 'email' => 'ahmad@rizquna.id'],
            ['name' => 'Siti Aminah', 'email' => 'siti@rizquna.id'],
            ['name' => 'Budi Santoso', 'email' => 'budi@rizquna.id'],
        ];

        foreach ($authors as $authData) {
            $author = Author::updateOrCreate(
                ['email' => $authData['email']],
                array_merge($authData, [
                    'phone' => '08123456789',
                    'status' => 'active',
                    'royalty_percentage' => 10.00,
                ])
            );

            // 2. Create Publishing Books
            $pubBook = Book::create([
                'type' => 'publishing',
                'title' => 'Membangun Masa Depan '.$author->name,
                'author_id' => $author->id,
                'isbn' => '978-602-'.rand(1000, 9999).'-0',
                'description' => 'Buku inspiratif tentang masa depan.',
                'price' => 75000,
                'stock' => 50,
                'status' => BookStatus::DRAFT,
            ]);

            // 3. Create Contract for the book
            Contract::create([
                'book_id' => $pubBook->id,
                'start_date' => now(),
                'end_date' => now()->addYears(2),
                'royalty_percentage' => 10.00,
                'status' => 'approved',
            ]);

            // 4. Create Printing Books
            Book::create([
                'type' => 'printing',
                'title' => 'Order Cetak Custom - '.$author->name,
                'author_id' => $author->id,
                'description' => 'Pesanan cetak khusus.',
                'status' => 'production',
            ]);
        }
    }
}
