<?php

namespace App\Domain\Payments;

use App\Enums\PaymentStatus;
use App\Enums\RoyaltyStatus;
use App\Models\Payment;
use App\Models\RoyaltyCalculation;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

class PaymentService
{
    public function generateInvoice(RoyaltyCalculation $calculation, User $user): Payment
    {
        if ($calculation->status !== RoyaltyStatus::Finalized) {
            throw new ConflictHttpException('Invoice hanya bisa dibuat dari royalti berstatus finalized.');
        }

        $existingPayment = $calculation->payment;

        if ($existingPayment) {
            return $existingPayment;
        }

        $invoiceNumber = $this->generateInvoiceNumber($calculation->period_month);

        $pdf = Pdf::loadView('pdf.invoice', [
            'calculation' => $calculation->load(['author', 'items.book']),
            'invoiceNumber' => $invoiceNumber,
            'generatedAt' => now(),
        ]);

        $path = 'invoices/'.$invoiceNumber.'.pdf';

        Storage::disk(config('filesystems.default'))->put($path, $pdf->output());

        return Payment::create([
            'royalty_calculation_id' => $calculation->id,
            'invoice_number' => $invoiceNumber,
            'invoice_path' => $path,
            'amount' => $calculation->total_amount,
            'status' => PaymentStatus::Unpaid,
            'created_by' => $user->id,
        ]);
    }

    public function markPaid(Payment $payment, User $user, ?string $paymentReference = null, ?string $paidAt = null): Payment
    {
        if ($payment->status === PaymentStatus::Paid) {
            return $payment;
        }

        $payment->update([
            'status' => PaymentStatus::Paid,
            'paid_at' => $paidAt ?? now(),
            'payment_reference' => $paymentReference,
        ]);

        $payment->calculation()->update([
            'status' => RoyaltyStatus::Paid,
        ]);

        return $payment->refresh();
    }

    private function generateInvoiceNumber(string $periodMonth): string
    {
        $sequence = str_pad((string) (Payment::query()->whereHas('calculation', fn ($q) => $q->where('period_month', $periodMonth))->count() + 1), 4, '0', STR_PAD_LEFT);

        return 'INV-RYL-'.str_replace('-', '', $periodMonth).'-'.$sequence;
    }
}
