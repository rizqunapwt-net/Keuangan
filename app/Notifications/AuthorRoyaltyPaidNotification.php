<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AuthorRoyaltyPaidNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $amount;
    protected $period;

    /**
     * Create a new notification instance.
     */
    public function __construct($amount, $period)
    {
        $this->amount = $amount;
        $this->period = $period;
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
        return (new MailMessage)
            ->subject('Royalti Telah Dibayar!')
            ->greeting('Halo ' . $notifiable->name . '!')
            ->line('Kabar baik! Royalti Anda telah dibayar.')
            ->line("Periode: {$this->period}")
            ->line("Jumlah: Rp " . number_format($this->amount, 0, ',', '.'))
            ->line('Pembayaran akan ditransfer ke rekening Anda dalam 1-3 hari kerja.')
            ->action('Lihat Detail', url('/admin/royalties'))
            ->line('Terima kasih telah menulis bersama kami!')
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
            'type' => 'royalty_paid',
            'message' => "Royalti periode {$this->period} sebesar Rp " . number_format($this->amount, 0, ',', '.') . ' telah dibayar',
            'amount' => $this->amount,
            'period' => $this->period,
            'url' => url('/admin/royalties'),
        ];
    }
}
