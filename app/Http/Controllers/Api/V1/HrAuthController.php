<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class HrAuthController extends Controller
{
    /**
     * POST /api/v1/hr/auth/login
     * Login with username+password, returns Sanctum token
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('username', $request->username)
            ->with('employee')
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['error' => 'invalid credentials'], 401);
        }

        if (!$user->is_active) {
            return response()->json(['error' => 'account is deactivated'], 403);
        }

        $user->update(['last_login_at' => now()]);

        $token = $user->createToken('hr-mobile', ['hr:*'])->plainTextToken;

        return response()->json([
            'token' => $token,
            'status' => 'success',
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'name' => $user->name,
                'role' => $user->role,
                'face_descriptor' => $user->face_descriptor,
                'employee' => $user->employee ? [
                    'id' => $user->employee->id,
                    'name' => $user->name,
                    'category' => $user->employee->category,
                ] : null,
            ],
        ]);
    }

    /**
     * POST /api/v1/hr/auth/logout
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['ok' => true]);
    }

    /**
     * POST /api/v1/hr/auth/biometric
     * Save face descriptor for the currently authenticated user
     */
    public function biometric(Request $request): JsonResponse
    {
        $request->validate([
            'descriptor' => 'required',
        ]);

        $request->user()->update([
            'face_descriptor' => is_string($request->descriptor)
            ? $request->descriptor
            : json_encode($request->descriptor),
        ]);

        return response()->json(['ok' => true]);
    }

    /**
     * GET /api/v1/hr/auth/me
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load('employee');

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'name' => $user->name,
                'role' => $user->role,
                'face_descriptor' => $user->face_descriptor,
                'employee' => $user->employee ? [
                    'id' => $user->employee->id,
                    'name' => $user->name,
                    'category' => $user->employee->category,
                ] : null,
            ],
        ]);
    }
}