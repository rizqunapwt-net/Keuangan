<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;

class HealthController extends Controller
{
    /**
     * Simple health check endpoint
     */
    public function health(): JsonResponse
    {
        return response()->json([
            'status' => 'healthy',
            'timestamp' => now()->toIso8601String(),
            'service' => 'rizquna-erp',
            'version' => config('app.version', '3.0.95'),
        ]);
    }

    /**
     * Detailed health check with dependencies
     */
    public function ready(): JsonResponse
    {
        $checks = [
            'database' => false,
            'redis' => false,
            'cache' => false,
            'storage' => false,
        ];

        $healthy = true;

        // Check database
        try {
            DB::connection()->getPdo();
            $checks['database'] = true;
        } catch (\Exception $e) {
            $healthy = false;
        }

        // Check Redis
        try {
            $result = Redis::ping();
            $checks['redis'] = ($result === 'PONG' || $result === '+PONG' || $result === true);
        } catch (\Exception $e) {
            $healthy = false;
        }

        // Check Cache
        try {
            Cache::put('health_check', true, 10);
            $checks['cache'] = Cache::get('health_check') === true;
        } catch (\Exception $e) {
            $healthy = false;
        }

        // Check Storage
        try {
            $path = 'health_check_'.time();
            \Storage::disk('local')->put($path, 'test');
            $checks['storage'] = \Storage::disk('local')->exists($path);
            \Storage::disk('local')->delete($path);
        } catch (\Exception $e) {
            $healthy = false;
        }

        return response()->json([
            'status' => $healthy ? 'healthy' : 'unhealthy',
            'timestamp' => now()->toIso8601String(),
            'service' => 'rizquna-erp',
            'version' => config('app.version', '3.0.95'),
            'checks' => $checks,
        ], $healthy ? 200 : 503);
    }

    /**
     * Liveness probe for Kubernetes/Docker
     */
    public function live(): JsonResponse
    {
        return response()->json([
            'status' => 'alive',
            'timestamp' => now()->toIso8601String(),
        ]);
    }
}
