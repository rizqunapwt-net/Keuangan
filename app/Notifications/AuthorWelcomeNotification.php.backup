<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AuthorWelcomeNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $token;

    /**
     * Create a new notification instance.
     */
    public function __construct($token)
    {
        $this->token = $token;
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
        $verificationUrl = url("/authors/verify-email?token={$this->token}&email=" . urlencode($notifiable->email));

        return (new MailMessage)
            ->subject('Selamat Bergabung di Rizquna!')
            ->greeting('Halo ' . $notifiable->name . '!')
            ->line('Selamat! Akun penulis Anda telah berhasil dibuat.')
            ->line('Untuk mulai menggunakan platform kami, silakan verifikasi email Anda dengan mengklik tombol di bawah ini:')
            ->action('Verifikasi Email', $verificationUrl)
            ->line('Setelah verifikasi, Anda dapat:')
            ->line('- Upload dan kelola buku Anda')
            ->line('- Track penjualan dan royalti secara real-time')
            ->line('- Tanda tangan kontrak digital')
            ->line('- Dapatkan pembayaran royalti tepat waktu')
            ->line('Email verifikasi ini berlaku selama 24 jam.')
            ->line('Jika Anda tidak mendaftar akun ini, abaikan email ini.')
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
            'type' => 'welcome',
            'message' => 'Selamat bergabung di Rizquna! Silakan verifikasi email Anda.',
            'url' => url("/authors/verify-email?token={$this->token}&email=" . urlencode($notifiable->email)),
        ];
    }
}
