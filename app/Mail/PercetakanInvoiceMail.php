<?php

namespace App\Mail;

use App\Models\Percetakan\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PercetakanInvoiceMail extends Mailable
{
    use Queueable, SerializesModels;

    public $order;
    protected $pdfContent;

    /**
     * Create a new message instance.
     */
    public function __construct(Order $order, string $pdfContent)
    {
        $this->order = $order;
        $this->pdfContent = $pdfContent;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Invoice Pesanan Percetakan #' . $this->order->order_number,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.percetakan.invoice',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [
            Attachment::fromData(fn () => $this->pdfContent, 'Invoice_'.$this->order->order_number.'.pdf')
                ->withMime('application/pdf'),
        ];
    }
}
