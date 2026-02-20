<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AuthorContractSignedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $bookTitle;
    protected $action; // 'approved' or 'rejected'

    /**
     * Create a new notification instance.
     */
    public function __construct($bookTitle, $action)
    {
        $this->bookTitle = $bookTitle;
        $this->action = $action;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $actionText = $this->action === 'approved' ? 'Disetujui' : 'Ditolak';
        $message = $this->action === 'approved' 
            ? 'Kontrak penjualan buku Anda telah disetujui.'
            : 'Kontrak penjualan buku Anda ditolak. Silakan cek dashboard untuk informasi lebih lanjut.';

        return (new MailMessage)
            ->subject("Kontrak {$actionText} - {$this->bookTitle}")
            ->greeting('Halo ' . $notifiable->name . '!')
            ->line($message)
            ->line("Buku: {$this->bookTitle}")
            ->line("Status: {$actionText}")
            ->action('Lihat Dashboard', url('/admin/dashboard'))
            ->salutation('Salam, Tim Rizquna');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'contract_' . $this->action,
            'message' => "Kontrak buku '{$this->bookTitle}' telah {$this->action}",
            'book_title' => $this->bookTitle,
            'action' => $this->action,
            'url' => url('/admin/contracts'),
        ];
    }
}
