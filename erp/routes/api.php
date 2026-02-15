<?php

use App\Http\Controllers\Api\V1\AuthTokenController;
use App\Http\Controllers\Api\V1\ContractController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\RoyaltyCalculationController;
use App\Http\Controllers\Api\V1\SalesImportController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::post('/auth/token', AuthTokenController::class)->middleware('throttle:auth');
});

Route::prefix('v1')->middleware('auth:sanctum')->group(function (): void {
    Route::post('/contracts', [ContractController::class, 'store'])->middleware('role:Admin|Legal');
    Route::put('/contracts/{contract}/approve', [ContractController::class, 'approve'])->middleware('role:Admin|Legal');
    Route::put('/contracts/{contract}/reject', [ContractController::class, 'reject'])->middleware('role:Admin|Legal');

    Route::post('/sales/import', SalesImportController::class)->middleware(['role:Finance', 'throttle:sales-import']);

    Route::post('/royalties/calculate', [RoyaltyCalculationController::class, 'calculate'])->middleware('role:Finance');
    Route::put('/royalties/{royaltyCalculation}/finalize', [RoyaltyCalculationController::class, 'finalize'])->middleware('role:Finance');
    Route::post('/royalties/{royaltyCalculation}/invoice', [RoyaltyCalculationController::class, 'invoice'])->middleware('role:Finance');

    Route::put('/payments/{payment}/mark-paid', [PaymentController::class, 'markPaid'])->middleware('role:Finance');
});
