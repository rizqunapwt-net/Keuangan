<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        /** @var Response $response */
        $response = $next($request);

        // Safe-by-default headers (avoid CSP here to prevent breaking Filament assets).
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

        // Optional CSP (report-only) for gradual rollout without breaking UI.
        if (filter_var((string) env('ERP_CSP_REPORT_ONLY', false), FILTER_VALIDATE_BOOLEAN)) {
            $response->headers->set('Content-Security-Policy-Report-Only', implode('; ', [
                "default-src 'self'",
                "base-uri 'self'",
                "form-action 'self'",
                "frame-ancestors 'none'",
                "img-src 'self' data: blob:",
                "style-src 'self' 'unsafe-inline'",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
                "font-src 'self' data:",
                "connect-src 'self'",
            ]));
        }

        if (app()->environment('production')) {
            // Enable HSTS only when served over HTTPS.
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }

        return $response;
    }
}
