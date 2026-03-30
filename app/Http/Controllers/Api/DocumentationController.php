<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Route;

class DocumentationController extends Controller
{
    /**
     * Get API documentation and endpoint list
     * GET /api/v1/documentation
     */
    public function __invoke(): JsonResponse
    {
        $routes = collect(Route::getRoutes()->getRoutes())
            ->filter(fn ($route) => str_starts_with($route->uri, 'api/'))
            ->map(fn ($route) => [
                'method' => collect($route->methods)->filter(fn ($m) => $m !== 'HEAD')->first(),
                'uri' => str_replace('api/', '', $route->uri),
                'name' => $route->getName(),
                'middleware' => $route->middleware(),
            ])
            ->groupBy('uri')
            ->map(fn ($endpoints) => $endpoints->first());

        $groupedRoutes = [
            'authentication' => [
                'POST /auth/login' => 'Login user',
                'POST /auth/logout' => 'Logout user',
                'POST /auth/change-password' => 'Change password',
                'GET /auth/me' => 'Get current user',
            ],
            'sales' => [
                'GET /sales' => 'List all sales',
                'POST /sales' => 'Create new sale (POS)',
                'GET /sales/{id}' => 'Get sale details',
                'DELETE /sales/{id}' => 'Delete sale',
                'PUT /sales/{id}/payment' => 'Update payment',
                'POST /sales/{id}/refund' => 'Process refund (Admin only)',
                'POST /sales/{id}/snap-token' => 'Generate Midtrans token',
            ],
            'finance' => [
                'GET /finance/summary' => 'Financial summary',
                'GET /finance/products' => 'List products',
                'POST /finance/products' => 'Create product',
                'GET /finance/receipts/{id}' => 'Print receipt (PDF)',
                'GET /finance/payment/config' => 'Get Midtrans config',
            ],
            'reports' => [
                'GET /finance/reports/profit-loss' => 'Profit & Loss report',
                'GET /finance/reports/balance-sheet' => 'Balance Sheet report',
                'GET /finance/reports/cash-flow' => 'Cash Flow report',
            ],
        ];

        return response()->json([
            'api_name' => config('app.name').' API',
            'version' => '1.0.0',
            'base_url' => config('app.url').'/api/v1',
            'authentication' => [
                'type' => 'Bearer Token (Laravel Sanctum)',
                'header' => 'Authorization: Bearer {token}',
            ],
            'endpoints' => $groupedRoutes,
            'rate_limits' => [
                'general' => '60 requests/minute',
                'write_operations' => '20-30 requests/minute',
                'delete_operations' => '10 requests/minute',
                'auth_endpoints' => '5-10 requests/minute',
            ],
            'response_format' => [
                'success' => [
                    'success' => true,
                    'data' => 'object|array',
                    'meta' => 'object (optional)',
                ],
                'error' => [
                    'success' => false,
                    'error' => 'string',
                    'errors' => 'object (validation errors)',
                ],
            ],
        ]);
    }
}
