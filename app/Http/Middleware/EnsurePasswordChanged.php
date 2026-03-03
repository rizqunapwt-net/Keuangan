<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePasswordChanged
{
    /**
     * Routes that are allowed even when must_change_password is true.
     */
    private array $allowedRouteNames = [
        'auth.change-password',
        'auth.logout',
        'auth.me',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->must_change_password) {
            // Allow specific routes
            if (! $request->routeIs(...$this->allowedRouteNames)) {
                return response()->json([
                    'success' => false,
                    'error' => [
                        'message' => 'Anda harus mengganti password terlebih dahulu sebelum melanjutkan.',
                        'errors' => [],
                    ],
                    'requires_action' => 'change_password',
                    'redirect' => '/ganti-password',
                    'meta' => ['timestamp' => now()->toIso8601String()],
                ], 403);
            }
        }

        return $next($request);
    }
}
