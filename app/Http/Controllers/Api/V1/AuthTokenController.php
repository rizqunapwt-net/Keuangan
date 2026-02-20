<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthTokenController extends Controller
{
    use ApiResponse;

    /**
     * Unified Login for ERP and HR
     * Accepts 'login' (email or username) and 'password'
     */
    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'login' => ['nullable', 'string'],
            'username' => ['nullable', 'string'],
            'password' => ['required', 'string'],
            'device_name' => ['nullable', 'string', 'max:255'],
        ]);

        // Accept both 'login' and 'username' fields for compatibility
        $login = $validated['login'] ?? $validated['username'] ?? null;

        if (!$login) {
            return $this->error('Username atau email harus diisi.', 422);
        }

        $user = User::query()
            ->where(function ($q) use ($login) {
            $q->where('email', $login)
                ->orWhere('username', $login);
        })
            ->with('employee')
            ->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            \App\Models\AuthLog::create([
                'event' => 'login_failed',
                'identifier' => $login,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'status' => 'failed',
                'reason' => 'invalid_credentials',
            ]);
            return $this->error('Kredensial tidak valid.', 401);
        }

        if (!$user->is_active) {
            \App\Models\AuthLog::create([
                'event' => 'login_failed',
                'identifier' => $login,
                'user_id' => $user->id,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'status' => 'failed',
                'reason' => 'account_inactive',
            ]);
            return $this->error('Akun tidak aktif.', 403);
        }

        \App\Models\AuthLog::create([
            'event' => 'login_success',
            'identifier' => $login,
            'user_id' => $user->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'status' => 'success',
        ]);

        $user->update(['last_login_at' => now()]);

        // Unified tokens for both HR and ERP needs
        $token = $user->createToken($validated['device_name'] ?? 'unified-token', ['*'])->plainTextToken;

        return $this->success([
            'access_token' => $token,
            'token' => $token, // alias for mobile compatibility
            'token_type' => 'Bearer',
            'status' => 'success',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'username' => $user->username,
                'role' => $user->role, // for admin dashboard
                'role_label' => $user->role,
                'roles' => $user->getRoleNames(),
                'employee' => $user->employee ? [
                    'id' => $user->employee->id,
                    'name' => $user->name,
                    'category' => $user->employee->category,
                ] : null,
            ],
        ]);
    }
}