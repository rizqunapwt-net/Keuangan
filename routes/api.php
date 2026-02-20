<?php

use App\Http\Controllers\Api\V1\AttendanceController;
use App\Http\Controllers\Api\V1\AuthTokenController;
use App\Http\Controllers\Api\V1\AuthorAuthController;
use App\Http\Controllers\Api\V1\AuthorPortalController;
use App\Http\Controllers\Api\V1\BookOrderController;
use App\Http\Controllers\Api\V1\ContractController;
use App\Http\Controllers\Api\V1\EmployeeController;
use App\Http\Controllers\Api\V1\HrAuthController;
use App\Http\Controllers\Api\V1\HrNotificationController;
use App\Http\Controllers\Api\V1\HrPayrollController;
use App\Http\Controllers\Api\V1\LeaveController;
use App\Http\Controllers\Api\V1\OvertimeController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\Percetakan\OrderController as PercetakanOrderController;
use App\Http\Controllers\Api\Percetakan\ProductionJobController;
use App\Http\Controllers\Api\Percetakan\JobCardController;
use App\Http\Controllers\Api\V1\PublishingController;
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

    // ── Publishing: Books ──
    Route::get('/books', [PublishingController::class , 'books']);
    Route::get('/books/isbn-tracking', [PublishingController::class , 'isbnTracking']);
    Route::get('/books/{id}', [PublishingController::class , 'bookDetail']);
    Route::post('/books', [PublishingController::class , 'storeBook']);
    Route::patch('/books/{id}', [PublishingController::class , 'updateBook']);
    Route::patch('/books/{id}/status', [PublishingController::class , 'updateBookStatus']);
    Route::get('/books/{id}/files', [PublishingController::class , 'bookFiles']);
    Route::post('/books/{id}/files', [PublishingController::class , 'uploadBookFile']);
    Route::get('/books/{id}/logs', [PublishingController::class , 'bookStatusLogs']);

    // ── Publishing: Print Orders ──
    Route::get('/print-orders', [PublishingController::class , 'printOrders']);
    Route::post('/print-orders', [PublishingController::class , 'storePrintOrder']);
    Route::patch('/print-orders/{id}', [PublishingController::class , 'updatePrintOrder']);

    // ── Publishing: Authors ──
    Route::get('/authors', [PublishingController::class , 'authors']);
    Route::post('/authors', [PublishingController::class , 'storeAuthor']);

    // ── Publishing: Contracts ──
    Route::get('/contracts', [PublishingController::class , 'contracts']);
    Route::get('/contracts/{id}', [PublishingController::class , 'contractDetail']);
    Route::post('/contracts', [ContractController::class , 'store']);
    Route::patch('/contracts/{id}', [PublishingController::class , 'updateContract']);
    Route::put('/contracts/{id}/approve', [PublishingController::class , 'approveContract']);
    Route::put('/contracts/{id}/reject', [PublishingController::class , 'rejectContract']);

    // ── Publishing: Status Reference ──
    Route::get('/book-statuses', [PublishingController::class , 'statusList']);

    // ── Book Orders & Sales (New) ──
    Route::get('/print-orders', [BookOrderController::class , 'orders']);
    Route::post('/print-orders', [BookOrderController::class , 'storeOrder']);
    Route::patch('/print-orders/{order}/status', [BookOrderController::class , 'updateOrderStatus']);

    Route::get('/sales', [BookOrderController::class , 'sales']);
    Route::post('/sales', [BookOrderController::class , 'storeSale']);
    Route::get('/sales/stats', [BookOrderController::class , 'salesStats']);

    // ── Author Portal (Transparency) ──
    Route::middleware('role:Author')->group(function () {
        // Dashboard & Profile
        Route::get('/author/dashboard', [AuthorPortalController::class , 'dashboard']);
        Route::get('/author/profile', [AuthorPortalController::class , 'profile']);
        Route::patch('/author/profile', [AuthorPortalController::class , 'updateProfile']);
        
        // Books
        Route::get('/author/books', [AuthorPortalController::class , 'books']);
        Route::patch('/author/books/{book}', [AuthorPortalController::class , 'updateBook']);
        
        // Contracts
        Route::get('/author/contracts', [AuthorPortalController::class , 'contracts']);
        Route::post('/author/contracts/{contract}/sign', [AuthorPortalController::class , 'signContract']);
        
        // Royalties
        Route::get('/author/royalties', [AuthorPortalController::class , 'royalties']);
        Route::get('/author/royalties/{id}/report', [AuthorPortalController::class , 'royaltyReport']);
        
        // Sales (transparency)
        Route::get('/author/sales', [AuthorPortalController::class , 'sales']);
    });

    // ── Author Auth (Public) ──
    Route::post('/authors/register', [AuthorAuthController::class , 'register']);
    Route::post('/authors/verify-email', [AuthorAuthController::class , 'verifyEmail']);
    Route::post('/authors/resend-verification', [AuthorAuthController::class , 'resendVerification']);
    Route::post('/authors/forgot-password', [AuthorAuthController::class , 'forgotPassword']);
    Route::post('/authors/reset-password', [AuthorAuthController::class , 'resetPassword']);

    // ── Percetakan (Printing Press) ──
    Route::prefix('percetakan')->middleware('auth:sanctum')->group(function () {
        // Orders
        Route::get('/orders/statistics', [PercetakanOrderController::class , 'statistics']);
        Route::apiResource('orders', PercetakanOrderController::class);
        
        // Production Jobs
        Route::get('/production-jobs/statistics', [ProductionJobController::class , 'statistics']);
        Route::post('/production-jobs/{productionJob}/start', [ProductionJobController::class , 'start']);
        Route::post('/production-jobs/{productionJob}/complete', [ProductionJobController::class , 'complete']);
        Route::post('/production-jobs/{productionJob}/hold', [ProductionJobController::class , 'hold']);
        Route::post('/production-jobs/{productionJob}/reject', [ProductionJobController::class , 'reject']);
        Route::apiResource('production-jobs', ProductionJobController::class);
        
        // Job Cards
        Route::get('/job-cards/statistics', [JobCardController::class , 'statistics']);
        Route::post('/job-cards/{jobCard}/start', [JobCardController::class , 'start']);
        Route::post('/job-cards/{jobCard}/complete', [JobCardController::class , 'complete']);
        Route::post('/job-cards/{jobCard}/qc', [JobCardController::class , 'qc']);
        Route::apiResource('job-cards', JobCardController::class);
    });
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

    // Employees — Admin/HR/Owner only
    Route::middleware('role:Admin|HR|Owner')->group(function () {
            Route::get('/employees', [EmployeeController::class , 'index']);
            Route::post('/employees', [EmployeeController::class , 'store']);
            Route::get('/employees/{id}', [EmployeeController::class , 'show']);
            Route::patch('/employees/{id}', [EmployeeController::class , 'update']);
            Route::delete('/employees/{id}', [EmployeeController::class , 'destroy']);
            Route::get('/employees/{id}/leave-balance', [LeaveController::class , 'balance']);

            // Admin-only status changes
            Route::patch('/leave-requests/{id}/status', [LeaveController::class , 'updateStatus']);
            Route::patch('/overtime-requests/{id}/status', [OvertimeController::class , 'updateStatus']);

            // Payroll — generate is admin-only
            Route::post('/payrolls/generate', [HrPayrollController::class , 'generate']);
        }
        );

        // Leave & Overtime — any authenticated employee can list/create their own
        Route::get('/leave-types', [LeaveController::class , 'types']);
        Route::get('/leave-requests', [LeaveController::class , 'index']);
        Route::post('/leave-requests', [LeaveController::class , 'store']);

        Route::get('/overtime-requests', [OvertimeController::class , 'index']);
        Route::post('/overtime-requests', [OvertimeController::class , 'store']);

        // Payroll — any authenticated user can view their own payroll
        Route::get('/payrolls', [HrPayrollController::class , 'index']);

        // Notifications — any authenticated user
        Route::get('/notifications', [HrNotificationController::class , 'index']);
        Route::patch('/notifications/{id}/read', [HrNotificationController::class , 'markRead']);
        Route::patch('/notifications/read-all', [HrNotificationController::class , 'markAllRead']);
    });