<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Payments\PaymentService;
use App\Http\Controllers\Controller;
use App\Http\Requests\MarkPaymentPaidRequest;
use App\Models\Payment;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

class PaymentController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly PaymentService $paymentService)
    {
    }

    public function markPaid(MarkPaymentPaidRequest $request, Payment $payment): JsonResponse
    {
        $payment = $this->paymentService->markPaid(
            payment: $payment,
            user: $request->user(),
            paymentReference: $request->validated('payment_reference'),
            paidAt: $request->validated('paid_at'),
        );

        return $this->success($payment);
    }
}
