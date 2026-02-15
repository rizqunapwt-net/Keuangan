<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\IssueTokenRequest;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;

class AuthTokenController extends Controller
{
    use ApiResponse;

    public function __invoke(IssueTokenRequest $request): JsonResponse
    {
        $user = User::query()->where('email', $request->validated('email'))->first();

        if (! $user || ! Hash::check($request->validated('password'), $user->password)) {
            return $this->error('Email atau password tidak valid.', 401);
        }

        if (! $user->is_active) {
            return $this->error('Akun tidak aktif.', 403);
        }

        $token = $user->createToken($request->validated('device_name') ?? 'internal-api-token')->plainTextToken;

        return $this->success([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
        ]);
    }
}
