<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect('/admin/login');
});

// ── Single Login Door: React SPA ──
// All login attempts funnel to the React admin-panel login page
Route::redirect('/panel/login', '/admin/login')->name('filament.admin.auth.login');

Route::get('/dashboard', function () {
    /** @var \App\Models\User $user */
    $user = auth()->user();

    if ($user->isKaryawan()) {
        $token = $user->createToken('auth_token')->plainTextToken;
        $frontendUrl = config('app.frontend_url', 'https://nre.infiatin.cloud');
        return redirect()->away($frontendUrl . '/?token=' . $token);
    }

    return redirect()->route('filament.admin.pages.dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class , 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class , 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class , 'destroy'])->name('profile.destroy');
});

// Logout via GET (used by Next.js frontend - matches Nginx ^/logout pattern)
Route::get('/logout-clear', function () {
    auth()->logout();
    request()->session()->invalidate();
    request()->session()->regenerateToken();
    return redirect('/admin/login');
});

require __DIR__ . '/auth.php';

// ── React Admin SPA catch-all ──
// Serves public/admin/index.html for all /admin/* routes not matched by Laravel
// This enables client-side routing in the React SPA
Route::get('/admin/{any?}', function () {
    $indexPath = public_path('admin/index.html');
    if (file_exists($indexPath)) {
        return response()->file($indexPath, [
        'Content-Type' => 'text/html',
        ]);
    }
    abort(404, 'Admin panel belum di-build. Jalankan: scripts/build-admin.sh');
})->where('any', '.*');

// ── Author Public Pages ──
Route::get('/authors/register', function () {
    return view('welcome'); // Will be handled by React router
});

Route::get('/authors/forgot-password', function () {
    return view('welcome'); // Will be handled by React router
});

Route::get('/authors/reset-password', function () {
    return view('welcome'); // Will be handled by React router
});