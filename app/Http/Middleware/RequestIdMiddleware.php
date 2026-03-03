<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class RequestIdMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Use client-provided ID only if it's a valid UUID; otherwise generate a new one
        $clientId = $request->header('X-Request-ID', '');
        $requestId = Str::isUuid($clientId) ? $clientId : (string) Str::uuid();

        // Add it to the request so it can be used in logs if needed
        $request->headers->set('X-Request-ID', $requestId);

        $response = $next($request);

        // Add it to the response header
        $response->headers->set('X-Request-ID', $requestId);

        return $response;
    }
}
