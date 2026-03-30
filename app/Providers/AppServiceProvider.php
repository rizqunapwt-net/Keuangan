<?php

namespace App\Providers;

use App\Models\User;
use App\Policies\FinancePolicy;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
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
        $this->registerGates();
        $this->validateEnvironment();

        if (class_exists(\App\Models\PurchaseOrder::class) && class_exists(\App\Observers\PurchaseObserver::class)) {
            \App\Models\PurchaseOrder::observe(\App\Observers\PurchaseObserver::class);
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
    }

    private function registerGates(): void
    {
        Gate::define('admin.access', function (User $user) {
            return $user->is_active && ($user->hasRole('Admin') || $user->hasPermissionTo('admin.access'));
        });

        Gate::define('finance.view_reports', function (User $user) {
            return (new FinancePolicy())->viewReports($user);
        });
        Gate::define('finance.manage_accounts', function (User $user) {
            return (new FinancePolicy())->manageAccounts($user);
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
