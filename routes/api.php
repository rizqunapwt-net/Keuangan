<?php

use App\Http\Controllers\Api\V1\AccountController;
use App\Http\Controllers\Api\V1\AdminDashboardController;
use App\Http\Controllers\Api\V1\AuditLogController;
use App\Http\Controllers\Api\V1\CashTransactionController;
use App\Http\Controllers\Api\V1\FinanceReportController;
use App\Http\Controllers\Api\V1\DebtController;
use App\Http\Controllers\Api\V1\Finance\BankController;
use App\Http\Controllers\Api\V1\Finance\ExpenseController;
use App\Http\Controllers\Api\V1\FinanceController;
use App\Http\Controllers\Api\V1\HealthController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\PercetakanController;
use App\Http\Controllers\Api\V1\SessionController;
use App\Http\Controllers\UnifiedLoginController;
use Illuminate\Support\Facades\Route;

// ══════════════════════════════════════════════════════════════════════════
// PUBLIC APIs (No Authentication Required)
// ══════════════════════════════════════════════════════════════════════════
Route::prefix('v1')->group(function (): void {
    Route::get('/health', [HealthController::class, 'health']);
    Route::get('/ready', [HealthController::class, 'ready']);
    Route::get('/live', [HealthController::class, 'live']);

    // API Documentation
    Route::get('/documentation', \App\Http\Controllers\Api\DocumentationController::class);

    // Authentication
    Route::post('/auth/login', [UnifiedLoginController::class, 'apiLogin'])->middleware('throttle:10,1');
    Route::post('/auth/forgot-password', [UnifiedLoginController::class, 'forgotPassword'])->middleware('throttle:5,1');
    Route::post('/auth/reset-password', [UnifiedLoginController::class, 'resetPassword'])->middleware('throttle:5,1');
});

// ══════════════════════════════════════════════════════════════════════════
// PROTECTED APIs (Authentication Required)
// ══════════════════════════════════════════════════════════════════════════
Route::prefix('v1')->middleware('auth:sanctum')->group(function (): void {

    // ── Auth ──
    Route::get('/auth/me', [UnifiedLoginController::class, 'me'])->name('auth.me');
    Route::post('/auth/logout', [UnifiedLoginController::class, 'logout'])->name('auth.logout');
    Route::post('/auth/change-password', [UnifiedLoginController::class, 'changePassword'])->name('auth.change-password');

    // ══════════════════════════════════════════════════════════════════════
    // ADMIN PANEL — All authenticated users are admin
    // ══════════════════════════════════════════════════════════════════════

        // ── Dashboard & Stats ──
        Route::get('/admin/dashboard-stats', [AdminDashboardController::class, 'salesStats']);
        Route::get('/dashboard/books/stats', [AdminDashboardController::class, 'bookStats']);
        Route::get('/dashboard/authors/stats', [AdminDashboardController::class, 'authorStats']);

        // ── Publishing ──
        Route::get('/books', [AdminDashboardController::class, 'books']);
        Route::get('/authors', [AdminDashboardController::class, 'authors']);

        // ── User Management ──
        Route::get('/admin/users', [\App\Http\Controllers\Api\V1\UserManagementController::class, 'index']);
        Route::get('/admin/users/roles', [\App\Http\Controllers\Api\V1\UserManagementController::class, 'roles']);
        Route::get('/admin/users/{user}', [\App\Http\Controllers\Api\V1\UserManagementController::class, 'show']);
        Route::post('/admin/users', [\App\Http\Controllers\Api\V1\UserManagementController::class, 'store']);
        Route::put('/admin/users/{user}', [\App\Http\Controllers\Api\V1\UserManagementController::class, 'update']);
        Route::patch('/admin/users/{user}/toggle-active', [\App\Http\Controllers\Api\V1\UserManagementController::class, 'toggleActive']);
        Route::delete('/admin/users/{user}', [\App\Http\Controllers\Api\V1\UserManagementController::class, 'destroy']);

        // ── Finance (Core) ──
        Route::prefix('finance')->middleware(['throttle:60,1'])->group(function () {
            Route::get('/summary', [FinanceController::class, 'summary']);
            Route::get('/invoices', [FinanceController::class, 'invoices']);
            Route::get('/journals', [FinanceController::class, 'journals']);
            Route::post('/journals', [FinanceController::class, 'storeJournal'])->middleware('throttle:30,1');
            Route::put('/journals/{journal}/reverse', [FinanceController::class, 'reverseJournal']);

            // Contacts
            Route::get('/contacts', [FinanceController::class, 'contacts']);
            Route::get('/contacts/{contactId}', [FinanceController::class, 'contactDetail']);
            Route::post('/contacts', [FinanceController::class, 'storeContact'])->middleware('throttle:30,1');
            Route::delete('/contacts/{contactId}', [FinanceController::class, 'destroyContact'])->middleware('throttle:20,1');

            // Chart of Accounts
            Route::get('/accounts/categories', [AccountController::class, 'categories']);
            Route::get('/accounts', [AccountController::class, 'index']);
            Route::post('/accounts', [AccountController::class, 'store'])->middleware('throttle:30,1');
            Route::put('/accounts/{id}', [AccountController::class, 'update'])->middleware('throttle:30,1');
            Route::delete('/accounts/{id}', [AccountController::class, 'destroy'])->middleware('throttle:20,1');

            // Expenses
            Route::get('/expenses', [ExpenseController::class, 'index']);
            Route::post('/expenses', [ExpenseController::class, 'store'])->middleware('throttle:30,1');
            Route::get('/expenses/{expense}', [ExpenseController::class, 'show']);
            Route::put('/expenses/{expense}', [ExpenseController::class, 'update'])->middleware('throttle:30,1');
            Route::delete('/expenses/{expense}', [ExpenseController::class, 'destroy'])->middleware('throttle:20,1');
            Route::put('/expenses/{expense}/void', [ExpenseController::class, 'void'])->middleware('throttle:20,1');

            // Banks
            Route::get('/banks', [BankController::class, 'index']);
            Route::post('/banks', [BankController::class, 'store'])->middleware('throttle:20,1');
            Route::get('/banks/{bank}', [BankController::class, 'show']);
            Route::put('/banks/{bank}', [BankController::class, 'update'])->middleware('throttle:20,1');
            Route::delete('/banks/{bank}', [BankController::class, 'destroy'])->middleware('throttle:10,1');

            // Reports
            Route::get('/reports/profit-loss', [FinanceController::class, 'profitAndLoss']);
            Route::get('/reports/balance-sheet', [FinanceController::class, 'balanceSheet']);
            Route::get('/reports/cash-flow', [FinanceController::class, 'cashFlow']);
            Route::get('/reports/profit-loss/pdf', [FinanceController::class, 'exportProfitLossPdf']);
            Route::get('/reports/profit-loss/excel', [FinanceController::class, 'exportProfitLossExcel']);
            Route::get('/reports/balance-sheet/excel', [FinanceController::class, 'exportBalanceSheetExcel']);
            Route::get('/reports/balance-sheet/pdf', [FinanceController::class, 'exportBalanceSheetPdf']);
            Route::get('/reports/cash-flow/pdf', [FinanceController::class, 'exportCashFlowPdf']);
            Route::get('/reports/cash-flow/excel', [FinanceController::class, 'exportCashFlowExcel']);

            // Debts & Receivables
            Route::get('/debts', [DebtController::class, 'index']);
            Route::post('/debts', [DebtController::class, 'store']);
            Route::get('/debts/{debt}', [DebtController::class, 'show']);
            Route::put('/debts/{debt}', [DebtController::class, 'update']);
            Route::delete('/debts/{debt}', [DebtController::class, 'destroy']);
            Route::post('/debts/{debt}/payments', [DebtController::class, 'storePayment']);
            Route::delete('/debts/payments/{payment}', [DebtController::class, 'destroyPayment']);

            // Cash Ledger (Buku Kas)
            Route::get('/cash-transactions', [CashTransactionController::class, 'index']);
            Route::get('/cash-summary', [CashTransactionController::class, 'summary']);
            Route::post('/cash-transactions', [CashTransactionController::class, 'store']);
            Route::delete('/cash-transactions/{cashTransaction}', [CashTransactionController::class, 'destroy']);

            // Reports
            Route::get('/reports/daily', [FinanceReportController::class, 'daily']);
            Route::get('/reports/monthly', [FinanceReportController::class, 'monthly']);
            Route::get('/reports/yearly', [FinanceReportController::class, 'yearly']);

        });

        // ── Percetakan ──
        Route::prefix('percetakan')->group(function (): void {
            Route::get('/customers', [PercetakanController::class, 'customers']);
            Route::get('/materials', [PercetakanController::class, 'materials']);
            Route::get('/orders', [PercetakanController::class, 'orders']);
            Route::patch('/orders/{orderId}/status', [PercetakanController::class, 'updateOrderStatus']);
        });

        // ── Audit Logs (Security) ──
        Route::prefix('audit')->group(function () {
            Route::get('/logs', [AuditLogController::class, 'index']);
            Route::get('/logs/{auditLog}', [AuditLogController::class, 'show']);
            Route::get('/logs-stats', [AuditLogController::class, 'stats']);
        });

    // Notifications & Sessions
    Route::get('/user/notifications', [NotificationController::class, 'index']);
    Route::get('/user/sessions', [SessionController::class, 'index']);
    Route::delete('/user/sessions/{id}', [SessionController::class, 'destroy']);
});
