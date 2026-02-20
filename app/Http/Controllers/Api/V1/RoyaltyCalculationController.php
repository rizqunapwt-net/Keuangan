<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Payments\PaymentService;
use App\Domain\Royalty\RoyaltyCalculationService;
use App\Http\Controllers\Controller;
use App\Http\Requests\CalculateRoyaltyRequest;
use App\Http\Requests\FinalizeRoyaltyRequest;
use App\Models\RoyaltyCalculation;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

class RoyaltyCalculationController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly RoyaltyCalculationService $royaltyCalculationService,
        private readonly PaymentService $paymentService,
    ) {
    }

    public function calculate(CalculateRoyaltyRequest $request): JsonResponse
    {
        try {
            $calculations = $this->royaltyCalculationService->calculateForPeriod(
                periodMonth: $request->validated('period_month'),
                user: $request->user(),
            );
        } catch (ConflictHttpException $exception) {
            return $this->error($exception->getMessage(), 409);
        }

        return $this->success($calculations);
    }

    public function finalize(FinalizeRoyaltyRequest $request, RoyaltyCalculation $royaltyCalculation): JsonResponse
    {
        try {
            $royaltyCalculation = $this->royaltyCalculationService->finalize($royaltyCalculation, $request->user());
        } catch (ConflictHttpException $exception) {
            return $this->error($exception->getMessage(), 409);
        }

        return $this->success($royaltyCalculation->load('author'));
    }

    public function invoice(RoyaltyCalculation $royaltyCalculation): JsonResponse
    {
        try {
            $payment = $this->paymentService->generateInvoice($royaltyCalculation, request()->user());
        } catch (ConflictHttpException $exception) {
            return $this->error($exception->getMessage(), 409);
        }

        return $this->success($payment, 201);
    }
}
