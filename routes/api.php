<?php

use App\Http\Controllers\Api\V1\AccountController;
use App\Http\Controllers\Api\V1\AdminDashboardController;
use App\Http\Controllers\Api\V1\AuditLogController;
use App\Http\Controllers\Api\V1\CashTransactionController;
use App\Http\Controllers\Api\V1\DebtController;
use App\Http\Controllers\Api\V1\Finance\BankController;
use App\Http\Controllers\Api\V1\Finance\ContactController;
use App\Http\Controllers\Api\V1\Finance\ExpenseController;
use App\Http\Controllers\Api\V1\Finance\InvoiceController;
use App\Http\Controllers\Api\V1\FinanceController;
use App\Http\Controllers\Api\V1\FinanceReportController;
use App\Http\Controllers\Api\V1\HealthController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\PercetakanCalculatorController;
use App\Http\Controllers\Api\V1\UserController;
use App\Http\Controllers\Api\V1\RoleController;
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
    Route::post('/auth/register', [UnifiedLoginController::class, 'register']);
    Route::post('/auth/forgot-password', [UnifiedLoginController::class, 'forgotPassword'])->middleware('throttle:5,1');
    Route::post('/auth/reset-password', [UnifiedLoginController::class, 'resetPassword'])->middleware('throttle:5,1');
});

// ══════════════════════════════════════════════════════════════════════════
// PROTECTED APIs (Authentication + Password Changed Required)
// ══════════════════════════════════════════════════════════════════════════
Route::prefix('v1')->middleware(['auth:sanctum', 'password.changed'])->group(function (): void {

    // ── Auth (excluded from password.changed via middleware allowlist) ──
    Route::get('/auth/me', [UnifiedLoginController::class, 'me'])->name('auth.me');
    Route::post('/auth/logout', [UnifiedLoginController::class, 'logout'])->name('auth.logout');
    Route::post('/auth/change-password', [UnifiedLoginController::class, 'changePassword'])->name('auth.change-password');
    Route::put('/auth/profile', [UserController::class, 'updateProfile']);

    // ── Notifications & Sessions (own user data, all roles) ──
    Route::get('/user/notifications', [NotificationController::class, 'index']);
    Route::get('/user/sessions', [SessionController::class, 'index']);
    Route::delete('/user/sessions/{id}', [SessionController::class, 'destroy']);

    // ══════════════════════════════════════════════════════════════════════
    // ADMIN-ONLY ROUTES (role:Admin)
    // ══════════════════════════════════════════════════════════════════════
    Route::middleware('role:Admin')->group(function (): void {

        // ── User Management ──
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::put('/users/{user}', [UserController::class, 'update']);
        Route::delete('/users/{user}', [UserController::class, 'destroy']);
        Route::get('/roles', [RoleController::class, 'index']);

        // ── Settings ──
        Route::get('/settings', [\App\Http\Controllers\SettingController::class, 'index']);
        Route::post('/settings', [\App\Http\Controllers\SettingController::class, 'update']);

        // ── Audit Logs (Admin-only, immutable records) ──
        Route::prefix('audit')->group(function () {
            Route::get('/logs', [AuditLogController::class, 'index']);
            Route::get('/logs/{auditLog}', [AuditLogController::class, 'show']);
            Route::get('/logs-stats', [AuditLogController::class, 'stats']);
        });
    });

    // ══════════════════════════════════════════════════════════════════════
    // DASHBOARD (permission: admin.access)
    // ══════════════════════════════════════════════════════════════════════
    Route::get('/admin/dashboard-stats', [AdminDashboardController::class, 'salesStats'])
        ->middleware('permission:admin.access');

    // ══════════════════════════════════════════════════════════════════════
    // FINANCE — Permission-based access
    // ══════════════════════════════════════════════════════════════════════
    Route::prefix('finance')->middleware(['throttle:60,1'])->group(function () {

        // ── Reports (permission: finance.view_reports) ──
        Route::middleware('permission:finance.view_reports')->group(function () {
            Route::get('/summary', [FinanceController::class, 'summary']);
            Route::get('/reports/profit-loss', [FinanceController::class, 'profitAndLoss']);
            Route::get('/reports/balance-sheet', [FinanceController::class, 'balanceSheet']);
            Route::get('/reports/cash-flow', [FinanceController::class, 'cashFlow']);
            Route::get('/reports/profit-loss/pdf', [FinanceController::class, 'exportProfitLossPdf']);
            Route::get('/reports/profit-loss/excel', [FinanceController::class, 'exportProfitLossExcel']);
            Route::get('/reports/balance-sheet/excel', [FinanceController::class, 'exportBalanceSheetExcel']);
            Route::get('/reports/balance-sheet/pdf', [FinanceController::class, 'exportBalanceSheetPdf']);
            Route::get('/reports/cash-flow/pdf', [FinanceController::class, 'exportCashFlowPdf']);
            Route::get('/reports/cash-flow/excel', [FinanceController::class, 'exportCashFlowExcel']);
            Route::get('/reports/daily', [FinanceReportController::class, 'daily']);
            Route::get('/reports/monthly', [FinanceReportController::class, 'monthly']);
            Route::get('/reports/yearly', [FinanceReportController::class, 'yearly']);
        });

        // ── Invoices (permission: sales_read / sales_write) ──
        Route::middleware('permission:sales_read')->group(function () {
            Route::get('/invoices', [InvoiceController::class, 'index']);
        });
        Route::middleware('permission:sales_write')->group(function () {
            Route::post('/invoices', [InvoiceController::class, 'store'])->middleware('throttle:30,1');
            Route::put('/invoices/{id}', [InvoiceController::class, 'update'])->middleware('throttle:30,1');
            Route::delete('/invoices/{id}', [InvoiceController::class, 'destroy'])->middleware('throttle:20,1');
            Route::patch('/invoices/{id}/toggle-paid', [InvoiceController::class, 'togglePaid'])->middleware('throttle:30,1');
        });

        // ── Contacts (permission: sales_read / sales_write) ──
        Route::middleware('permission:sales_read')->group(function () {
            Route::get('/contacts', [ContactController::class, 'index']);
            Route::get('/contacts/{contactId}', [ContactController::class, 'show']);
        });
        Route::middleware('permission:sales_write')->group(function () {
            Route::post('/contacts', [ContactController::class, 'store'])->middleware('throttle:30,1');
            Route::delete('/contacts/{contactId}', [ContactController::class, 'destroy'])->middleware('throttle:20,1');
        });

        // ── Chart of Accounts (permission: finance.manage_accounts) ──
        Route::middleware('permission:accounting_read')->group(function () {
            Route::get('/accounts/categories', [AccountController::class, 'categories']);
            Route::get('/accounts', [AccountController::class, 'index']);
        });
        Route::middleware('permission:accounting_write')->group(function () {
            Route::post('/accounts', [AccountController::class, 'store'])->middleware('throttle:30,1');
            Route::put('/accounts/{id}', [AccountController::class, 'update'])->middleware('throttle:30,1');
            Route::delete('/accounts/{id}', [AccountController::class, 'destroy'])->middleware('throttle:20,1');
        });

        // ── Expenses (permission: accounting_read / accounting_write) ──
        Route::middleware('permission:accounting_read')->group(function () {
            Route::get('/expenses', [ExpenseController::class, 'index']);
            Route::get('/expenses/{expense}', [ExpenseController::class, 'show']);
        });
        Route::middleware('permission:accounting_write')->group(function () {
            Route::post('/expenses', [ExpenseController::class, 'store'])->middleware('throttle:30,1');
            Route::put('/expenses/{expense}', [ExpenseController::class, 'update'])->middleware('throttle:30,1');
            Route::delete('/expenses/{expense}', [ExpenseController::class, 'destroy'])->middleware('throttle:20,1');
            Route::put('/expenses/{expense}/void', [ExpenseController::class, 'void'])->middleware('throttle:20,1');
        });

        // ── Banks (permission: finance.manage_accounts) ──
        Route::middleware('permission:finance.manage_accounts')->group(function () {
            Route::get('/banks', [BankController::class, 'index']);
            Route::post('/banks', [BankController::class, 'store'])->middleware('throttle:20,1');
            Route::get('/banks/{bank}', [BankController::class, 'show']);
            Route::put('/banks/{bank}', [BankController::class, 'update'])->middleware('throttle:20,1');
            Route::delete('/banks/{bank}', [BankController::class, 'destroy'])->middleware('throttle:10,1');
        });

        // ── Debts & Receivables (permission: debt.view / debt.create etc.) ──
        Route::middleware('permission:debt.view')->group(function () {
            Route::get('/debts', [DebtController::class, 'index']);
            Route::get('/debts/{debt}', [DebtController::class, 'show']);
        });
        Route::middleware('permission:debt.create')->group(function () {
            Route::post('/debts', [DebtController::class, 'store']);
        });
        Route::middleware('permission:debt.edit')->group(function () {
            Route::put('/debts/{debt}', [DebtController::class, 'update']);
        });
        Route::middleware('permission:debt.delete')->group(function () {
            Route::delete('/debts/{debt}', [DebtController::class, 'destroy']);
            Route::delete('/debts/payments/{payment}', [DebtController::class, 'destroyPayment']);
        });
        Route::middleware('permission:debt.record_payment')->group(function () {
            Route::post('/debts/{debt}/payments', [DebtController::class, 'storePayment']);
        });

        // ── Cash Ledger / Buku Kas (permission: finance.manage_accounts) ──
        Route::middleware('permission:finance.manage_accounts')->group(function () {
            Route::get('/cash-transactions', [CashTransactionController::class, 'index']);
            Route::get('/cash-summary', [CashTransactionController::class, 'summary']);
            Route::post('/cash-transactions', [CashTransactionController::class, 'store']);
            Route::delete('/cash-transactions/{cashTransaction}', [CashTransactionController::class, 'destroy']);
        });
    });

    // ── Percetakan (permission: pos_access) ──
    Route::prefix('percetakan/calculator')->middleware(['throttle:60,1', 'permission:pos_access'])->group(function () {
        Route::post('/calculate', [PercetakanCalculatorController::class, 'calculate']);
        Route::post('/brosur', [PercetakanCalculatorController::class, 'calculateBrosur']);
        Route::post('/spanduk', [PercetakanCalculatorController::class, 'calculateSpanduk']);
        Route::post('/buku', [PercetakanCalculatorController::class, 'calculateBuku']);
        Route::post('/kartu-nama', [PercetakanCalculatorController::class, 'calculateKartuNama']);
        Route::post('/stiker', [PercetakanCalculatorController::class, 'calculateStiker']);
        Route::get('/options', [PercetakanCalculatorController::class, 'getOptions']);
        Route::post('/quick', [PercetakanCalculatorController::class, 'quickCalculate']);
    });
});
