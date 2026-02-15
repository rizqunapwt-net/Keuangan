<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Spatie\Activitylog\Models\Activity;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(10)->by($request->ip());
        });

        RateLimiter::for('sales-import', function (Request $request) {
            return Limit::perMinute(30)->by($request->user()?->id ?: $request->ip());
        });

        Activity::creating(function (Activity $activity): void {
            if (app()->runningInConsole()) {
                return;
            }

            $properties = collect($activity->properties ?? []);

            $properties->put('request_meta', [
                'ip_address' => request()->ip(),
                'method' => request()->method(),
                'path' => request()->path(),
                'route_name' => optional(request()->route())->getName(),
                'user_agent' => str((string) request()->userAgent())->limit(500)->value(),
            ]);

            $activity->properties = $properties;
        });
    }
}
