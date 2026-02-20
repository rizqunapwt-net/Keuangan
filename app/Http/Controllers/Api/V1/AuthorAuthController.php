<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Author;
use App\Models\User;
use App\Notifications\AuthorWelcomeNotification;
use App\Notifications\AuthorPasswordResetNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
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
            'email_verified_at' => null, // Need verification
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
            'status' => 'pending_approval', // Need admin approval
        ]);

        // Generate email verification token
        $verificationToken = Str::random(60);
        $user->remember_token = $verificationToken;
        $user->save();

        // Send welcome notification with verification link
        try {
            $user->notify(new AuthorWelcomeNotification($verificationToken));
        } catch (\Exception $e) {
            // Log error but don't fail registration
            \Log::error('Failed to send welcome email: ' . $e->getMessage());
        }

        // Generate auth token
        $token = $user->createToken('author-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Pendaftaran berhasil! Silakan cek email untuk verifikasi.',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'username' => $user->username,
                    'email_verified' => false,
                    'roles' => $user->getRoleNames(),
                ],
                'access_token' => $token,
                'token_type' => 'Bearer',
            ],
        ], 201);
    }

    /**
     * Verify email
     */
    public function verifyEmail(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email'],
        ]);

        $user = User::where('email', $validated['email'])
            ->where('remember_token', $validated['token'])
            ->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Link verifikasi tidak valid atau sudah kadaluarsa',
            ], 400);
        }

        // Mark email as verified
        $user->email_verified_at = now();
        $user->remember_token = null;
        $user->save();

        // Update author status to active (auto-approve for now)
        $author = Author::where('email', $user->email)->first();
        if ($author && $author->status === 'pending_approval') {
            $author->status = 'active';
            $author->save();
        }

        return response()->json([
            'success' => true,
            'message' => 'Email berhasil diverifikasi! Silakan login.',
        ]);
    }

    /**
     * Resend verification email
     */
    public function resendVerification(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Email tidak ditemukan',
            ], 404);
        }

        if ($user->email_verified_at) {
            return response()->json([
                'success' => true,
                'message' => 'Email sudah terverifikasi',
            ]);
        }

        // Generate new token
        $verificationToken = Str::random(60);
        $user->remember_token = $verificationToken;
        $user->save();

        // Send email
        try {
            $user->notify(new AuthorWelcomeNotification($verificationToken));
        } catch (\Exception $e) {
            \Log::error('Failed to resend verification email: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengirim email verifikasi',
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Email verifikasi telah dikirim ulang',
        ]);
    }

    /**
     * Send password reset link
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Email tidak ditemukan',
            ], 404);
        }

        // Generate reset token
        $token = Password::createToken($user);

        // Send notification
        try {
            $user->notify(new AuthorPasswordResetNotification($token));
        } catch (\Exception $e) {
            \Log::error('Failed to send password reset email: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengirim email reset password',
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Link reset password telah dikirim ke email Anda',
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
