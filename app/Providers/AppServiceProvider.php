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
        // Observers — wrapped in try-catch because some models/observers
        // may not exist on all environments (e.g., server vs local)
        $observers = [
            [\App\Models\Book::class, \App\Observers\BookObserver::class],
            [\App\Models\Sale::class, \App\Observers\SaleObserver::class],
        ];

        // These may not exist on all environments yet
        $optionalObservers = [
            ['App\Models\SalesImport', 'App\Observers\SalesImportObserver'],
            ['App\Models\RoyaltyCalculation', 'App\Observers\RoyaltyCalculationObserver'],
            ['App\Models\Accounting\Journal', 'App\Observers\Accounting\JournalObserver'],
        ];

        foreach ($observers as [$model, $observer]) {
            try {
                $model::observe($observer);
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning("Observer registration skipped: {$e->getMessage()}");
            }
        }

        foreach ($optionalObservers as [$model, $observer]) {
            try {
                if (class_exists($model) && class_exists($observer)) {
                    $model::observe($observer);
                }
            } catch (\Throwable $e) {
                // Silently skip — these are optional modules
            }
        }

        if (config('app.env') === 'production') {
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }

        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(10)->by($request->ip());
        });

        RateLimiter::for('sales-import', function (Request $request) {
            return Limit::perMinute(30)->by($request->user()?->id ?: $request->ip());
        });

        // Activity log enrichment — only if spatie/activitylog is installed
        try {
            if (class_exists(Activity::class)) {
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
        } catch (\Throwable $e) {
            // spatie/activitylog not installed or misconfigured
        }
    }
}