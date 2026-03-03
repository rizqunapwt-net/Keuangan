<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class SessionController extends Controller
{
    public function index(): JsonResponse
    {
        $user = auth()->user();
        $currentToken = $user->currentAccessToken();

        $sessions = $user->tokens()
            ->orderBy('last_used_at', 'desc')
            ->get()
            ->map(fn ($token) => [
                'id' => $token->id,
                'name' => $token->name,
                'last_used_at' => $token->last_used_at,
                'created_at' => $token->created_at,
                'is_current' => $token->id === $currentToken?->id,
            ]);

        return response()->json(['success' => true, 'data' => $sessions]);
    }

    public function destroy(int $id): JsonResponse
    {
        $user = auth()->user();
        $currentToken = $user->currentAccessToken();

        if ($currentToken && $currentToken->id === $id) {
            return response()->json(['success' => false, 'message' => 'Tidak dapat menghapus sesi aktif saat ini.'], 422);
        }

        $deleted = $user->tokens()->where('id', $id)->delete();

        if (! $deleted) {
            return response()->json(['success' => false, 'message' => 'Sesi tidak ditemukan.'], 404);
        }

        return response()->json(['success' => true, 'message' => 'Sesi berhasil dihapus.']);
    }
}
