<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Sales\SalesImportService;
use App\Http\Controllers\Controller;
use App\Http\Requests\ImportSalesRequest;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class SalesImportController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly SalesImportService $salesImportService)
    {
    }

    public function __invoke(ImportSalesRequest $request): JsonResponse
    {
        try {
            $import = $this->salesImportService->import(
                file: $request->file('file'),
                periodMonth: $request->validated('period_month'),
                marketplaceCode: $request->validated('marketplace_code'),
                user: $request->user(),
            );
        } catch (ValidationException $exception) {
            return $this->error('Validasi import gagal.', 422, $exception->errors());
        }

        return $this->success($import, 201);
    }
}
