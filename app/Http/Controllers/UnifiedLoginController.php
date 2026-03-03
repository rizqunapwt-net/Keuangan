<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class UnifiedLoginController extends Controller
{
    use ApiResponse;

    /**
     * API Login - Returns token for SPA/Mobile
     * Accepts: email, username, or login (auto-detect)
     */
    public function apiLogin(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'login' => ['nullable', 'string'],
                'email' => ['nullable', 'string'],
                'username' => ['nullable', 'string'],
                'password' => ['required', 'string'],
                'device_name' => ['nullable', 'string', 'max:255'],
            ]);

            // Accept login, email, or username field (in priority order)
            $identifier = $validated['login'] ?? $validated['email'] ?? $validated['username'] ?? null;

            if (! $identifier) {
                return $this->error('Email atau username harus diisi.', 422);
            }

            $user = $this->findUserByIdentifier($identifier);

            if (! $user || ! Hash::check($validated['password'], $user->password)) {
                $this->logAuthEvent('login_failed', $identifier, null, 'invalid_credentials', $request);

                return $this->error('Kredensial tidak valid.', 401);
            }

            if (! $user->is_active) {
                $this->logAuthEvent('login_failed', $identifier, $user->id, 'account_inactive', $request);

                return response()->json([
                    'success' => false,
                    'error' => [
                        'message' => 'Akun tidak aktif. Hubungi administrator.',
                    ],
                    'meta' => ['timestamp' => now()->toIso8601String()],
                ], 403);
            }

            if (! $this->isAdminUser($user)) {
                $this->logAuthEvent('login_failed', $identifier, $user->id, 'not_admin', $request);

                return response()->json([
                    'success' => false,
                    'error' => [
                        'message' => 'Akses ditolak. Hanya admin yang dapat login.',
                    ],
                    'meta' => ['timestamp' => now()->toIso8601String()],
                ], 403);
            }

            $this->logAuthEvent('login_success', $identifier, $user->id, 'success', $request);
            $user->update(['last_login_at' => now()]);

            $token = $user->createToken($validated['device_name'] ?? 'unified-token', ['*'])->plainTextToken;

            return $this->success([
                'access_token' => $token,
                'token' => $token,
                'token_type' => 'Bearer',
                'status' => 'success',
                'must_change_password' => (bool) $user->must_change_password,
                'redirect_url' => $user->must_change_password
                ? env('FRONTEND_URL', 'http://localhost:3000').'/ganti-password'
                : $this->getRedirectUrl($user, $token),
                'user' => $this->formatUser($user),
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            Log::error('API Login Error: '.$e->getMessage(), [
                'exception' => get_class($e),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'error' => [
                    'message' => 'Terjadi kesalahan pada server. Silakan coba lagi.',
                ],
                'meta' => ['timestamp' => now()->toIso8601String()],
            ], 500);
        }
    }

    /**
     * Web Login - Session-based for Filament
     * Accepts: email or username
     */
    public function webLogin(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => ['nullable', 'string'],
            'username' => ['nullable', 'string'],
            'password' => ['required', 'string'],
        ]);

        $identifier = $request->input('email') ?? $request->input('username');
        $password = $request->input('password');

        if (! $identifier) {
            throw ValidationException::withMessages([
                'email' => 'Email atau username harus diisi.',
            ]);
        }

        $user = $this->findUserByIdentifier($identifier);

        if (! $user || ! Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => 'Kredensial tidak valid.',
            ]);
        }

        if (! $user->is_active) {
            throw ValidationException::withMessages([
                'email' => 'Akun tidak aktif. Hubungi administrator.',
            ]);
        }

        if (! $this->isAdminUser($user)) {
            throw ValidationException::withMessages([
                'email' => 'Akses ditolak. Hanya admin yang dapat login.',
            ]);
        }

        Auth::login($user, $request->boolean('remember'));
        $request->session()->regenerate();

        $this->logAuthEvent('login_success', $identifier, $user->id, 'success', $request);
        $user->update(['last_login_at' => now()]);

        return redirect()->intended($this->getWebRedirectUrl($user));
    }

    /**
     * Find user by email or username
     */
    private function findUserByIdentifier(string $identifier): ?User
    {
        return User::query()
            ->where(function ($q) use ($identifier) {
                $q->where('email', $identifier)
                    ->orWhere('username', $identifier);
            })
            ->first();
    }

    /**
     * Kasir project policy: all active users can access this panel.
     * Only one role (admin) exists in this system.
     */
    private function isAdminUser(User $user): bool
    {
        return (bool) $user->is_active;
    }

    /**
     * Get redirect URL based on user role
     */
    private function getRedirectUrl(User $user, string $token): string
    {
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');

        return $frontendUrl.'/dashboard';
    }

    /**
     * Get web redirect URL (session-based)
     */
    private function getWebRedirectUrl(User $user): string
    {
        return '/dashboard';
    }

    /**
     * Format user data for response
     */
    private function formatUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'username' => $user->username,
            'role' => 'admin',
            'permissions' => [],
            'role_label' => 'Administrator',
            'must_change_password' => (bool) $user->must_change_password,
            'tenant' => [
                'id' => 1,
                'name' => 'Rizquna Kasir',
                'subdomain' => 'kasir',
            ],
        ];
    }

    /**
     * Log authentication event
     */
    private function logAuthEvent(
        string $event,
        string $identifier,
        ?int $userId,
        string $reason,
        Request $request
    ): void {
        try {
            \App\Models\AuthLog::create([
                'event' => $event,
                'identifier' => $identifier,
                'user_id' => $userId,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'status' => $event === 'login_success' ? 'success' : 'failed',
                'reason' => $reason,
            ]);
        } catch (\Exception $e) {
            // Silently fail if AuthLog table doesn't exist
        }
    }

    /**
     * Get Current Authenticated User (Legacy Support)
     */
    public function me(Request $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (! $user) {
            return $this->error('Tidak terautentikasi.', 401);
        }

        return $this->success([
            'user' => $this->formatUser($user),
            'status' => 'success',
        ]);
    }

    /**
     * Change password (supports first-time mandatory change)
     */
    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => ['required', 'string'],
            'new_password' => [
                'required',
                'string',
                'min:8',
                'confirmed', // requires new_password_confirmation
                'different:current_password',
                'regex:/[A-Z]/', // at least 1 uppercase
                'regex:/[0-9]/', // at least 1 digit
            ],
        ], [
            'new_password.regex' => 'Password baru harus mengandung minimal 1 huruf kapital dan 1 angka.',
            'new_password.different' => 'Password baru tidak boleh sama dengan password lama.',
            'new_password.confirmed' => 'Konfirmasi password tidak cocok.',
        ]);

        /** @var User $user */
        $user = $request->user();

        if (! Hash::check($request->current_password, $user->password)) {
            return $this->error('Password saat ini tidak sesuai.', 422, [
                'current_password' => ['Password saat ini tidak sesuai.'],
            ]);
        }

        $user->update([
            'password' => $request->new_password,
            'must_change_password' => false,
            'password_changed_at' => now(),
        ]);

        $this->logAuthEvent('password_changed', $user->email, $user->id, 'success', $request);

        return $this->success([
            'message' => 'Password berhasil diubah.',
            'redirect_url' => $this->getRedirectUrl($user, ''), // Token not needed here
        ]);
    }

    /**
     * Handle logout for both API and Web
     */
    public function logout(Request $request): RedirectResponse|JsonResponse
    {
        $user = $request->user();

        if ($user) {
            // Revoke all tokens for this user
            $user->tokens()->delete();

            $this->logAuthEvent('logout', $user->email ?? $user->username, $user->id, 'success', $request);
        }

        if ($request->expectsJson()) {
            return $this->success(['message' => 'Logged out successfully']);
        }

        // Session-based logout (web)
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/login');
    }

    /**
     * Register a new user - DISABLED FOR SECURITY
     */
    public function register(Request $request): JsonResponse
    {
        return $this->error('Registrasi publik dinonaktifkan.', 403);
    }

    /**
     * Send password reset link - HARDENED
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email'],
        ]);

        // Always return success to prevent email enumeration.
        // Trigger Laravel built-in reset flow only when possible.
        try {
            \Illuminate\Support\Facades\Password::sendResetLink([
                'email' => $validated['email'],
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to send password reset email: '.$e->getMessage());
        }

        return $this->success([
            'message' => 'Jika email terdaftar, link reset password akan segera dikirim.',
        ]);
    }

    /**
     * Reset password
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'token' => ['required'],
            'email' => ['required', 'email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $status = \Illuminate\Support\Facades\Password::reset(
            $validated,
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                ])->save();
            }
        );

        if ($status === \Illuminate\Support\Facades\Password::PASSWORD_RESET) {
            return $this->success([
                'message' => 'Password berhasil direset',
            ]);
        }

        return $this->error(__($status), 400);
    }
}
