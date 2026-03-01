<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Domain\Finance\Services\PaymentService;
use App\Models\Sale;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    public function __construct(private readonly PaymentService $paymentService) {}

    /**
     * List all payments.
     *
     * GET /api/v1/finance/payments
     */
    public function index(Request $request): JsonResponse
    {
        $payments = \App\Models\Payment::with(['user:id,name'])
            ->latest()
            ->paginate($request->input('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $payments->items(),
            'meta' => [
                'current_page' => $payments->currentPage(),
                'last_page' => $payments->lastPage(),
                'per_page' => $payments->perPage(),
                'total' => $payments->total(),
            ],
        ]);
    }

    /**
     * Generate Midtrans Snap Token for an existing Sale.
     *
     * POST /api/v1/sales/{sale}/snap-token
     */
    public function snapToken(Sale $sale): JsonResponse
    {
        // 1. Validasi status pembayaran
        if ($sale->payment_status === 'paid') {
            return response()->json([
                'success' => false,
                'message' => 'Transaksi ini sudah lunas.'
            ], 422);
        }

        try {
            // 2. Load relasi items & product untuk Midtrans item_details
            $sale->load(['items.product']);

            $token = $this->paymentService->createSnapToken($sale);

            return response()->json([
                'success' => true,
                'snap_token' => $token
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat token pembayaran: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Handle Midtrans Webhook Notification.
     *
     * POST /api/v1/payments/midtrans/webhook
     */
    public function webhook(Request $request): JsonResponse
    {
        try {
            $this->paymentService->handleWebhook($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Notification handled successfully'
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 403);
        } catch (\Exception $e) {
            Log::error('Midtrans Webhook Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Internal Server Error'
            ], 500);
        }
    }

    /**
     * Print receipt for a payment.
     *
     * GET /api/v1/finance/receipts/{paymentId}
     */
    public function printReceipt(int $paymentId): JsonResponse
    {
        $payment = \App\Models\Payment::with(['user:id,name'])->find($paymentId);

        if (! $payment) {
            return response()->json([
                'success' => false,
                'message' => 'Payment not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $payment,
        ]);
    }
}
