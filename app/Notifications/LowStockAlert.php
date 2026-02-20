<?php

namespace App\Notifications;

use App\Models\Book;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class LowStockAlert extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public Book $book)
    {
    //
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->error()
            ->subject("🚨 Low Stock Alert: {$this->book->title}")
            ->line("The stock for '{$this->book->title}' has reached a critical level.")
            ->line("Current Stock: {$this->book->stock}")
            ->action('Update Stock', url('/admin/books/' . $this->book->id . '/edit'))
            ->line('Please restock as soon as possible to avoid losing sales.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'book_id' => $this->book->id,
            'title' => $this->book->title,
            'stock' => $this->book->stock,
            'message' => "Stock for '{$this->book->title}' is low ({$this->book->stock} items remaining).",
        ];
    }
}