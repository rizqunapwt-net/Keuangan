<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AuthorPasswordResetNotification extends Notification implements ShouldQueue
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
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $resetUrl = url("/authors/reset-password?token={$this->token}&email=" . urlencode($notifiable->email));

        return (new MailMessage)
            ->subject('Reset Password - Rizquna')
            ->greeting('Halo!')
            ->line('Anda menerima email ini karena ada permintaan reset password untuk akun Anda.')
            ->action('Reset Password', $resetUrl)
            ->line('Link reset password ini berlaku selama 60 menit.')
            ->line('Jika Anda tidak meminta reset password, abaikan email ini dan tidak ada perubahan yang akan dilakukan.')
            ->line('Untuk keamanan, jangan forward email ini ke siapapun.')
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
            'type' => 'password_reset',
            'message' => 'Link reset password telah dikirim ke email Anda',
        ];
    }
}
