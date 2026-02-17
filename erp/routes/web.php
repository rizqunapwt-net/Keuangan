<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('login');
});

// Unified Login Door
Route::redirect('/admin/login', '/login')->name('filament.admin.auth.login');

Route::get('/dashboard', function () {
    /** @var \App\Models\User $user */
    $user = auth()->user();

    if ($user->isKaryawan()) {
        $token = $user->createToken('auth_token')->plainTextToken;
        $frontendUrl = env('FRONTEND_URL', 'http://125.165.206.248:3000');
        return redirect()->away($frontendUrl . '/?token=' . $token);
    }

    return redirect()->route('filament.admin.pages.dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class , 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class , 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class , 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';