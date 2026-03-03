<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class RequestLogger
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $startTime = microtime(true);
        $requestId = uniqid('req_');

        // Add request ID to headers for tracking
        $request->attributes->set('request_id', $requestId);

        // Log request details
        Log::channel('api')->info('API Request', [
            'request_id' => $requestId,
            'method' => $request->method(),
            'url' => $request->fullUrl(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'user_id' => $request->user()?->id,
            'query' => config('app.debug') ? $request->query() : null,
            'body' => config('app.debug') && in_array($request->method(), ['POST', 'PUT', 'PATCH']) ? $request->except(['password', 'password_confirmation']) : null,
        ]);

        $response = $next($request);

        // Calculate response time
        $responseTime = round((microtime(true) - $startTime) * 1000, 2);

        // Log response details
        Log::channel('api')->info('API Response', [
            'request_id' => $requestId,
            'status' => $response->getStatusCode(),
            'response_time_ms' => $responseTime,
            'content_length' => strlen($response->getContent()),
        ]);

        // Add timing header for debugging
        if (config('app.debug')) {
            $response->headers->set('X-Response-Time', "{$responseTime}ms");
            $response->headers->set('X-Request-ID', $requestId);
        }

        return $response;
    }
}
