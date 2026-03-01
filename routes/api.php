<?php

use App\Http\Controllers\Api\V1\HealthController;
use App\Http\Controllers\Api\V1\AccountController;
use App\Http\Controllers\Api\V1\AdminDashboardController;
use App\Http\Controllers\Api\V1\FinanceController;
use App\Http\Controllers\Api\V1\Finance\ExpenseController;
use App\Http\Controllers\Api\V1\Finance\BankController;
use App\Http\Controllers\Api\V1\Finance\ProductController;
use App\Http\Controllers\Api\V1\Finance\WarehouseController;
use App\Http\Controllers\Api\V1\Finance\DeliveryController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\SaleController;
use App\Http\Controllers\Api\V1\SessionController;
use App\Http\Controllers\Api\V1\PaymentWebhookController;
use App\Http\Controllers\UnifiedLoginController;
use Illuminate\Support\Facades\Route;

// ══════════════════════════════════════════════════════════════════════════
// PUBLIC APIs (No Authentication Required)
// ══════════════════════════════════════════════════════════════════════════
Route::prefix('v1')->group(function (): void {
    Route::get('/health', [HealthController::class, 'health']);
    Route::get('/ready', [HealthController::class, 'ready']);
    Route::get('/live', [HealthController::class, 'live']);

    Route::post('/webhooks/payment', [\App\Http\Controllers\Api\V1\PaymentController::class, 'webhook']);

    // Authentication
    Route::post('/auth/login', [UnifiedLoginController::class, 'apiLogin'])->middleware('throttle:10,1');
    Route::post('/auth/register', [UnifiedLoginController::class, 'register'])->middleware('throttle:10,1');
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
    // ADMIN PANEL — Unified Access
    // ══════════════════════════════════════════════════════════════════════
    Route::middleware(['password.changed'])->group(function () {

        // ── Dashboard & Stats ──
        Route::get('/admin/dashboard-stats', [AdminDashboardController::class, 'bookStats']);
        
        // ── User Management ──
        Route::get('/admin/users', [\App\Http\Controllers\Api\V1\UserManagementController::class, 'index']);
        Route::get('/admin/users/roles', [\App\Http\Controllers\Api\V1\UserManagementController::class, 'roles']);
        Route::get('/admin/users/{user}', [\App\Http\Controllers\Api\V1\UserManagementController::class, 'show']);
        Route::post('/admin/users', [\App\Http\Controllers\Api\V1\UserManagementController::class, 'store']);
        Route::put('/admin/users/{user}', [\App\Http\Controllers\Api\V1\UserManagementController::class, 'update']);
        Route::patch('/admin/users/{user}/toggle-active', [\App\Http\Controllers\Api\V1\UserManagementController::class, 'toggleActive']);
        Route::delete('/admin/users/{user}', [\App\Http\Controllers\Api\V1\UserManagementController::class, 'destroy']);

        // ── Sales (Inventory System) ──
        Route::apiResource('sales', SaleController::class)->except(['update', 'edit']);
        Route::post('sales/{sale}/snap-token', [\App\Http\Controllers\Api\V1\PaymentController::class, 'snapToken']);

        // ── Finance (Core) ──
        Route::prefix('finance')->group(function () {
            Route::get('/summary', [FinanceController::class, 'summary']);
            Route::get('/invoices', [FinanceController::class, 'invoices']);
            Route::get('/journals', [FinanceController::class, 'journals']);
            Route::post('/journals', [FinanceController::class, 'storeJournal']);
            Route::put('/journals/{journal}/reverse', [FinanceController::class, 'reverseJournal']);
            Route::get('/sales-orders', [FinanceController::class, 'salesOrders']);
            Route::get('/payments', [PaymentController::class, 'index']);

            // Contacts
            Route::get('/contacts', [FinanceController::class, 'contacts']);
            Route::get('/contacts/{contactId}', [FinanceController::class, 'contactDetail']);
            Route::post('/contacts', [FinanceController::class, 'storeContact']);
            Route::delete('/contacts/{contactId}', [FinanceController::class, 'destroyContact']);

            // Chart of Accounts
            Route::get('/accounts/categories', [AccountController::class, 'categories']);
            Route::get('/accounts', [AccountController::class, 'index']);
            Route::post('/accounts', [AccountController::class, 'store']);
            Route::put('/accounts/{id}', [AccountController::class, 'update']);
            Route::delete('/accounts/{id}', [AccountController::class, 'destroy']);

            // Expenses
            Route::get('/expenses', [ExpenseController::class, 'index']);
            Route::post('/expenses', [ExpenseController::class, 'store']);
            Route::get('/expenses/{expense}', [ExpenseController::class, 'show']);
            Route::put('/expenses/{expense}', [ExpenseController::class, 'update']);
            Route::delete('/expenses/{expense}', [ExpenseController::class, 'destroy']);
            Route::put('/expenses/{expense}/void', [ExpenseController::class, 'void']);

            // Banks
            Route::get('/banks', [BankController::class, 'index']);
            Route::post('/banks', [BankController::class, 'store']);
            Route::get('/banks/{bank}', [BankController::class, 'show']);
            Route::put('/banks/{bank}', [BankController::class, 'update']);
            Route::delete('/banks/{bank}', [BankController::class, 'destroy']);

            // Products
            Route::get('/products', [ProductController::class, 'index']);
            Route::post('/products', [ProductController::class, 'store']);
            Route::get('/products/{product}', [ProductController::class, 'show']);
            Route::put('/products/{product}', [ProductController::class, 'update']);
            Route::delete('/products/{product}', [ProductController::class, 'destroy']);

            // Warehouses
            Route::get('/warehouses', [WarehouseController::class, 'index']);
            Route::post('/warehouses', [WarehouseController::class, 'store']);
            Route::get('/warehouses/{warehouse}', [WarehouseController::class, 'show']);
            Route::put('/warehouses/{warehouse}', [WarehouseController::class, 'update']);
            Route::delete('/warehouses/{warehouse}', [WarehouseController::class, 'destroy']);

            // Deliveries
            Route::get('/deliveries', [DeliveryController::class, 'index']);
            Route::post('/deliveries', [DeliveryController::class, 'store']);
            Route::get('/deliveries/{delivery}', [DeliveryController::class, 'show']);
            Route::put('/deliveries/{delivery}', [DeliveryController::class, 'update']);
            Route::delete('/deliveries/{delivery}', [DeliveryController::class, 'destroy']);

            // Purchases
            Route::get('/purchases', [FinanceController::class, 'purchases']);
            Route::post('/purchases', [FinanceController::class, 'storePurchase']);
            
            // Reports
            Route::get('/reports/profit-loss', [FinanceController::class, 'profitAndLoss']);
            Route::get('/reports/balance-sheet', [FinanceController::class, 'balanceSheet']);
            Route::get('/reports/cash-flow', [FinanceController::class, 'cashFlow']);
            Route::get('/reports/profit-loss/pdf', [FinanceController::class, 'exportProfitLossPdf']);
            
            // POS Receipt
            Route::get('/receipts/{saleId}', [PaymentController::class, 'printReceipt']);
        });
    });

    // Notifications & Sessions
    Route::get('/user/notifications', [NotificationController::class, 'index']);
    Route::get('/user/sessions', [SessionController::class, 'index']);
    Route::delete('/user/sessions/{id}', [SessionController::class, 'destroy']);
});
