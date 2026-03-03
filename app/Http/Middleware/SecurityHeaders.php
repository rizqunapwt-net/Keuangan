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
        $response->headers->set('Permissions-Policy', 'geolocation=(self), microphone=(), camera=(self)');

        // Content Security Policy - Enforced in production, Report-Only in development
        if (app()->environment('production')) {
            $cspDirectives = [
                "default-src 'self'",
                "base-uri 'self'",
                "form-action 'self'",
                "frame-ancestors 'none'",
                "img-src 'self' data: blob: https:",
                "style-src 'self' 'unsafe-inline' https:",
                "script-src 'self' 'unsafe-inline' https://app.midtrans.com https://app.sandbox.midtrans.com",
                "font-src 'self' data: https:",
                "connect-src 'self' https://api.midtrans.com https://api.sandbox.midtrans.com https:",
                "frame-src 'self' https://app.midtrans.com https://app.sandbox.midtrans.com https:",
                "object-src 'none'",
                'upgrade-insecure-requests',
            ];

            $response->headers->set(
                'Content-Security-Policy',
                implode('; ', $cspDirectives)
            );
        } else {
            // Development - Report-Only mode for testing
            $cspDirectives = [
                "default-src 'self'",
                "base-uri 'self'",
                "form-action 'self'",
                "frame-ancestors 'none'",
                "img-src 'self' data: blob: https:",
                "style-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://app.midtrans.com https://app.sandbox.midtrans.com",
                "font-src 'self' data: https:",
                "connect-src 'self' https://api.midtrans.com https://api.sandbox.midtrans.com https: wss:",
                "frame-src 'self' https://app.midtrans.com https://app.sandbox.midtrans.com https:",
                "object-src 'none'",
                'report-uri /api/v1/csp-report',
                'report-to csp-endpoint',
            ];

            $response->headers->set(
                'Content-Security-Policy-Report-Only',
                implode('; ', $cspDirectives)
            );
        }

        if (app()->environment('production')) {
            // Enable HSTS only when served over HTTPS.
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

            // Additional production security headers
            $response->headers->set('X-XSS-Protection', '1; mode=block');
            $response->headers->set('Cross-Origin-Opener-Policy', 'same-origin');
            $response->headers->set('Cross-Origin-Embedder-Policy', 'require-corp');
        }

        return $response;
    }
}
