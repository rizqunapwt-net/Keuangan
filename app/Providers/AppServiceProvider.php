<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
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
        $this->validateEnvironment();

        \App\Models\PurchaseOrder::observe(\App\Observers\PurchaseObserver::class);

        if (config('app.env') === 'production') {
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }

        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(10)->by($request->ip());
        });
    }

    private function validateEnvironment(): void
    {
        $critical = [
            'APP_KEY',
            'DB_CONNECTION',
        ];

        foreach ($critical as $var) {
            if (! env($var)) {
                \Illuminate\Support\Facades\Log::error("Critical environment variable missing: {$var}");
            }
        }
    }
}
