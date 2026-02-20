<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Author;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Spatie\Permission\Models\Role;

class AuthorAuthController extends Controller
{
    /**
     * Register a new author
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'min:3'],
            'username' => ['required', 'string', 'max:255', 'min:3', 'unique:users'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'phone' => ['nullable', 'string', 'max:20'],
            'bio' => ['nullable', 'string', 'max:500'],
            'bank_name' => ['nullable', 'string', 'max:255'],
            'bank_account' => ['nullable', 'string', 'max:50'],
            'bank_account_name' => ['nullable', 'string', 'max:255'],
        ]);

        // Create user
        $user = User::create([
            'name' => $validated['name'],
            'username' => $validated['username'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'is_active' => true,
        ]);

        // Assign Author role
        $authorRole = Role::firstOrCreate(['name' => 'Author']);
        $user->assignRole($authorRole);

        // Create author profile
        Author::create([
            'user_id' => $user->id,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'bio' => $validated['bio'] ?? null,
            'bank_name' => $validated['bank_name'] ?? null,
            'bank_account' => $validated['bank_account'] ?? null,
            'bank_account_name' => $validated['bank_account_name'] ?? null,
            'status' => 'active',
        ]);

        // Generate token
        $token = $user->createToken('author-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Pendaftaran berhasil',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'username' => $user->username,
                    'roles' => $user->getRoleNames(),
                ],
                'access_token' => $token,
                'token_type' => 'Bearer',
            ],
        ], 201);
    }

    /**
     * Send password reset link
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email'],
        ]);

        $status = Password::sendResetLink(
            $validated
        );

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json([
                'success' => true,
                'message' => 'Link reset password telah dikirim ke email Anda',
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => __($status),
        ], 400);
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

        $status = Password::reset(
            $validated,
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password)
                ])->save();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json([
                'success' => true,
                'message' => 'Password berhasil direset',
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => __($status),
        ], 400);
    }
}
