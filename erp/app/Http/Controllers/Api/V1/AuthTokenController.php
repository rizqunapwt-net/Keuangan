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
            'login' => ['required', 'string'],
            'password' => ['required', 'string'],
            'device_name' => ['nullable', 'string', 'max:255'],
        ]);

        $login = $validated['login'];

        $user = User::query()
            ->where(function ($q) use ($login) {
            $q->where('email', $login)
                ->orWhere('username', $login);
        })
            ->with('employee')
            ->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return $this->error('Kredensial tidak valid.', 401);
        }

        if (!$user->is_active) {
            return $this->error('Akun tidak aktif.', 403);
        }

        $user->update(['last_login_at' => now()]);

        // Unified tokens for both HR and ERP needs
        $token = $user->createToken($validated['device_name'] ?? 'unified-token', ['*'])->plainTextToken;

        return $this->success([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'username' => $user->username,
                'role_label' => $user->role, // kept for retro-compatibility
                'roles' => $user->getRoleNames(),
                'employee' => $user->employee ? [
                    'id' => $user->employee->id,
                    'category' => $user->employee->category,
                ] : null,
            ],
        ]);
    }
}