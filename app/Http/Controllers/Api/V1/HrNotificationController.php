<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\HrNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HrNotificationController extends Controller
{
    /**
     * GET /api/v1/hr/notifications
     */
    public function index(Request $request): JsonResponse
    {
        $employeeId = $request->query('employeeId');

        if (!$employeeId) {
            return response()->json(['success' => false, 'error' => 'employeeId required'], 400);
        }

        // Verify ownership via user->employee
        $user = $request->user();
        $employee = $user->employee;

        if (!$employee || $employee->id !== $employeeId) {
            // Allow admin to access any
            if (!$user->isAdmin()) {
                return response()->json(['success' => false, 'error' => 'Unauthorized'], 403);
            }
        }

        $notifications = HrNotification::where('employee_id', $employeeId)
            ->orderByDesc('created_at')
            ->limit(50)
            ->get();

        return response()->json(['success' => true, 'data' => $notifications]);
    }

    /**
     * PATCH /api/v1/hr/notifications/{id}/read
     */
    public function markRead(string $id): JsonResponse
    {
        $notification = HrNotification::find($id);

        if (!$notification) {
            return response()->json(['success' => false, 'error' => 'Not found'], 404);
        }

        $notification->update(['is_read' => true, 'read_at' => now()]);

        return response()->json(['success' => true, 'data' => $notification]);
    }

    /**
     * PATCH /api/v1/hr/notifications/read-all
     */
    public function markAllRead(Request $request): JsonResponse
    {
        $request->validate(['employeeId' => 'required|uuid']);

        $user = $request->user();
        $employee = $user->employee;

        if (!$user->isAdmin() && (!$employee || $employee->id !== $request->employeeId)) {
            return response()->json(['success' => false, 'error' => 'Unauthorized'], 403);
        }

        HrNotification::where('employee_id', $request->employeeId)
            ->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => now()]);

        return response()->json(['success' => true, 'message' => 'All notifications marked as read']);
    }
}