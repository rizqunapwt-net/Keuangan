<?php

namespace App\Observers;

use App\Models\Book;
use App\Enums\BookStatus;
use Illuminate\Support\Facades\Log;

class BookObserver
{
    /**
     * Handle the Book "updated" event.
     */
    public function updated(Book $book): void
    {
        // Detect status change to 'PUBLISHED'
        if ($book->isDirty('status') && $book->status === BookStatus::PUBLISHED) {
            $this->handlePublication($book);
        }
    }

    /**
     * Handle logic when a book is published.
     */
    protected function handlePublication(Book $book): void
    {
        Log::info("Book Published: {$book->title} (ID: {$book->id})");
    }
}