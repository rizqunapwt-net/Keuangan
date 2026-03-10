<?php

use Illuminate\Support\Facades\Route;

/*
 |--------------------------------------------------------------------------
 | Web Routes — SPA Fallback
 |--------------------------------------------------------------------------
 | Serve React SPA for all routes except /api/*
 | API routes handled by routes/api.php via RouteServiceProvider
 |--------------------------------------------------------------------------
 */

// Explicit redirects for root and legacy paths
Route::redirect('/', '/admin/dashboard');
Route::redirect('/login', '/admin/login');
Route::redirect('/dashboard', '/admin/dashboard');
Route::redirect('/panel/login', '/admin/login');

// SPA fallback — catch all non-API routes
Route::get('/{any}', function () {
    // Testing: return simple HTML response
    if (app()->environment('testing')) {
        return response('<html><body>Test Response</body></html>')
            ->header('Content-Type', 'text/html');
    }

    // Serve React SPA from either admin-panel build output or Laravel build output.
    $candidates = [
        ['path' => public_path('admin/index.html'), 'rewrite_assets' => true],
        ['path' => public_path('build/index.html'), 'rewrite_assets' => false],
    ];

    foreach ($candidates as $candidate) {
        $path = $candidate['path'];
        if (! file_exists($path)) {
            continue;
        }

        $html = file_get_contents($path);
        if (! is_string($html)) {
            continue;
        }

        // Vite admin build commonly emits "/assets/*" while files live in "/admin/assets/*".
        if ($candidate['rewrite_assets']) {
            $html = preg_replace('/([\'"])\/assets\//', '$1/admin/assets/', $html) ?? $html;
            $html = preg_replace('/([\'"])\/vite\.svg/', '$1/admin/vite.svg', $html) ?? $html;
            
            // Fix double /admin/admin/ if it happens
            $html = str_replace('/admin/admin/', '/admin/', $html);
        }

        return response($html)
            ->header('Content-Type', 'text/html; charset=UTF-8');
    }

    return response('App not built yet. Run: cd admin-panel && npm run build', 503);
})->where(
    'any',
    '^(?!api|assets|build|css|js|images|storage|fonts|favicon|robots\.txt|sitemap\.xml|admin/assets|admin/vite\.svg).*$'
);
