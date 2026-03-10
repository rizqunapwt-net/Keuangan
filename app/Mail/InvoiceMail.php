<?php

namespace App\Mail;

use App\Models\Debt;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class InvoiceMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public Debt $debt;

    /**
     * Create a new message instance.
     */
    public function __construct(Debt $debt)
    {
        $this->debt = $debt;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Invoice Tagihan #' . 'INV-' . $this->debt->id . ' - Rizquna.ID',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.invoice',
            with: [
                'debt' => $this->debt,
                'contactName' => $this->debt->contact?->name ?? $this->debt->client_name,
                'invoiceNumber' => 'INV-' . $this->debt->id,
                'amount' => $this->debt->amount,
                'dueDate' => $this->debt->due_date ? $this->debt->due_date->format('d/m/Y') : '-',
            ]
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
