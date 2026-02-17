<?php

use App\Http\Controllers\Api\V1\AttendanceController;
use App\Http\Controllers\Api\V1\AuthTokenController;
use App\Http\Controllers\Api\V1\ContractController;
use App\Http\Controllers\Api\V1\EmployeeController;
use App\Http\Controllers\Api\V1\HrAuthController;
use App\Http\Controllers\Api\V1\HrNotificationController;
use App\Http\Controllers\Api\V1\HrPayrollController;
use App\Http\Controllers\Api\V1\LeaveController;
use App\Http\Controllers\Api\V1\OvertimeController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\RoyaltyCalculationController;
use App\Http\Controllers\Api\V1\SalesImportController;
use Illuminate\Support\Facades\Route;

/*
 |--------------------------------------------------------------------------
 | API v1 Routes — Unified NRE Enterprise
 |--------------------------------------------------------------------------
 |
 | Two subsystems share the same Laravel API:
 |   1. ERP (Publishing/Royalties) — Sanctum + Filament
 |   2. HR  (Attendance/Payroll)   — Sanctum token-based
 |
 */

Route::prefix('v1')->group(function (): void {

    // ── Unified Auth (email or username + password → Sanctum token) ──
    Route::post('/auth/login', AuthTokenController::class)->middleware('throttle:auth');
    Route::post('/auth/token', AuthTokenController::class)->middleware('throttle:auth'); // compatibility alias

    // ── Public Tracking ──
    Route::get('/tracking', [\App\Http\Controllers\Api\V1\PublicTrackingController::class , 'track']);
});

// ── ERP Protected Routes ──
Route::prefix('v1')->middleware('auth:sanctum')->group(function (): void {
    Route::post('/contracts', [ContractController::class , 'store'])->middleware('role:Admin|Legal');
    Route::put('/contracts/{contract}/approve', [ContractController::class , 'approve'])->middleware('role:Admin|Legal');
    Route::put('/contracts/{contract}/reject', [ContractController::class , 'reject'])->middleware('role:Admin|Legal');

    Route::post('/sales/import', SalesImportController::class)->middleware(['role:Finance', 'throttle:sales-import']);

    Route::post('/royalties/calculate', [RoyaltyCalculationController::class , 'calculate'])->middleware('role:Finance');
    Route::put('/royalties/{royaltyCalculation}/finalize', [RoyaltyCalculationController::class , 'finalize'])->middleware('role:Finance');
    Route::post('/royalties/{royaltyCalculation}/invoice', [RoyaltyCalculationController::class , 'invoice'])->middleware('role:Finance');

    Route::put('/payments/{payment}/mark-paid', [PaymentController::class , 'markPaid'])->middleware('role:Finance');
});

// ── HR Protected Routes (Attendance, Leave, Overtime, Payroll) ──
Route::prefix('v1/hr')->middleware('auth:sanctum')->group(function (): void {

    // Auth
    Route::post('/auth/logout', [HrAuthController::class , 'logout']);
    Route::post('/auth/biometric', [HrAuthController::class , 'biometric']);
    Route::get('/auth/me', [HrAuthController::class , 'me']);

    // Attendance
    Route::get('/attendance/status', [AttendanceController::class , 'status']);
    Route::get('/attendance/history', [AttendanceController::class , 'history']);
    Route::get('/attendance/summary', [AttendanceController::class , 'summary']);
    Route::post('/attendance/check-in', [AttendanceController::class , 'checkIn']);
    Route::post('/attendance/check-out', [AttendanceController::class , 'checkOut']);
    Route::put('/attendance/{id}/correct', [AttendanceController::class , 'correct']);

    // Employees (Protected)
    Route::middleware('role:Admin|HR|Owner')->group(function () {
            Route::get('/employees', [EmployeeController::class , 'index']);
            Route::post('/employees', [EmployeeController::class , 'store']);
            Route::get('/employees/{id}', [EmployeeController::class , 'show']);
            Route::patch('/employees/{id}', [EmployeeController::class , 'update']);
            Route::delete('/employees/{id}', [EmployeeController::class , 'destroy']);
        }
        );
        Route::get('/employees/{id}/leave-balance', [LeaveController::class , 'balance']);

        // Leave
        Route::get('/leave-types', [LeaveController::class , 'types']);
        Route::get('/leave-requests', [LeaveController::class , 'index']);
        Route::post('/leave-requests', [LeaveController::class , 'store']);
        Route::patch('/leave-requests/{id}/status', [LeaveController::class , 'updateStatus'])->middleware('role:Admin|HR|Owner');

        // Overtime
        Route::get('/overtime-requests', [OvertimeController::class , 'index']);
        Route::post('/overtime-requests', [OvertimeController::class , 'store']);
        Route::patch('/overtime-requests/{id}/status', [OvertimeController::class , 'updateStatus'])->middleware('role:Admin|HR|Owner');

        // Payroll
        Route::get('/payrolls', [HrPayrollController::class , 'index']);
        Route::post('/payrolls/generate', [HrPayrollController::class , 'generate'])->middleware('role:Admin|HR|Owner');

        // Notifications
        Route::get('/notifications', [HrNotificationController::class , 'index']);
        Route::patch('/notifications/{id}/read', [HrNotificationController::class , 'markRead']);
        Route::patch('/notifications/read-all', [HrNotificationController::class , 'markAllRead']);
    });