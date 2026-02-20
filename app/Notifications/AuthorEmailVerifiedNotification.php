<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AuthorEmailVerifiedNotification extends Notification implements ShouldQueue
{
    use Queueable;

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
            ->subject('Email Terverifikasi!')
            ->greeting('Halo ' . $notifiable->name . '!')
            ->line('Email Anda telah berhasil terverifikasi.')
            ->line('Akun Anda sekarang aktif dan Anda dapat mulai menggunakan semua fitur platform kami.')
            ->action('Buka Dashboard', url('/admin/dashboard'))
            ->line('Selamat menulis dan semoga sukses dengan karya Anda!')
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
            'type' => 'email_verified',
            'message' => 'Email Anda telah terverifikasi',
            'url' => url('/admin/dashboard'),
        ];
    }
}
