<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = auth()->user();
        $query = $user->notifications()->latest();

        if ($request->filled('unread_only') && $request->boolean('unread_only')) {
            $query = $user->unreadNotifications()->latest();
        }

        $notifications = $query->paginate($request->get('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $notifications->items(),
            'meta' => [
                'current_page' => $notifications->currentPage(),
                'last_page' => $notifications->lastPage(),
                'per_page' => $notifications->perPage(),
                'total' => $notifications->total(),
                'unread_count' => $user->unreadNotifications()->count(),
            ],
        ]);
    }

    public function markRead(string $id): JsonResponse
    {
        $notification = auth()->user()->notifications()->findOrFail($id);
        $notification->markAsRead();

        return response()->json(['success' => true, 'message' => 'Notifikasi ditandai sudah dibaca.']);
    }

    public function markAllRead(): JsonResponse
    {
        auth()->user()->unreadNotifications()->update(['read_at' => now()]);

        return response()->json(['success' => true, 'message' => 'Semua notifikasi ditandai sudah dibaca.']);
    }

    public function updatePreferences(Request $request): JsonResponse
    {
        $author = auth()->user()->author;
        if (! $author) {
            return response()->json(['success' => false, 'message' => 'Author profile not found'], 404);
        }

        $validated = $request->validate([
            'notification_preferences' => ['required', 'array'],
            'notification_preferences.email_new_contract' => ['nullable', 'boolean'],
            'notification_preferences.email_royalty_report' => ['nullable', 'boolean'],
            'notification_preferences.email_book_status' => ['nullable', 'boolean'],
            'notification_preferences.push_chat' => ['nullable', 'boolean'],
        ]);

        $current = $author->notification_preferences ?? [];
        $author->update([
            'notification_preferences' => array_merge($current, $validated['notification_preferences']),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Preferensi notifikasi berhasil diperbarui.',
            'data' => ['notification_preferences' => $author->fresh()->notification_preferences],
        ]);
    }
}
