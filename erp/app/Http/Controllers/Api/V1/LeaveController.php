<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\HrNotification;
use App\Models\LeaveBalance;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LeaveController extends Controller
{
    /**
     * GET /api/v1/hr/leave-types
     */
    public function types(): JsonResponse
    {
        $leaveTypes = LeaveType::where('is_active', true)->orderBy('name')->get();
        return response()->json(['success' => true, 'data' => $leaveTypes]);
    }

    /**
     * GET /api/v1/hr/leave-requests
     */
    public function index(Request $request): JsonResponse
    {
        $query = LeaveRequest::with(['employee.user', 'leaveType']);

        if ($employeeId = $request->query('employeeId')) {
            $query->where('employee_id', $employeeId);
        }
        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }
        if ($startDate = $request->query('startDate')) {
            $query->where('start_date', '>=', $startDate);
        }
        if ($endDate = $request->query('endDate')) {
            $query->where('start_date', '<=', $endDate);
        }

        $leaveRequests = $query->orderByDesc('submitted_at')->get();

        return response()->json([
            'success' => true,
            'data' => $leaveRequests,
            'total' => $leaveRequests->count(),
        ]);
    }

    /**
     * POST /api/v1/hr/leave-requests
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'employeeId' => 'required|uuid|exists:employees,id',
            'leaveTypeId' => 'required|uuid|exists:leave_types,id',
            'startDate' => 'required|date',
            'endDate' => 'required|date|after_or_equal:startDate',
            'reason' => 'required|string|min:10',
            'attachmentUrl' => 'nullable|url',
        ]);

        $totalDays = $this->calculateBusinessDays($validated['startDate'], $validated['endDate']);

        // Check balance
        $balance = LeaveBalance::where('employee_id', $validated['employeeId'])
            ->where('year', now()->year)
            ->where('leave_type_id', $validated['leaveTypeId'])
            ->first();

        if ($balance && $balance->remaining < $totalDays) {
            return response()->json([
                'success' => false,
                'error' => 'Insufficient leave balance',
                'details' => ['requested' => $totalDays, 'available' => $balance->remaining],
            ], 400);
        }

        $leaveRequest = LeaveRequest::create([
            'request_number' => LeaveRequest::generateRequestNumber(),
            'employee_id' => $validated['employeeId'],
            'leave_type_id' => $validated['leaveTypeId'],
            'start_date' => $validated['startDate'],
            'end_date' => $validated['endDate'],
            'total_days' => $totalDays,
            'reason' => $validated['reason'],
            'attachment_url' => $validated['attachmentUrl'] ?? null,
            'status' => 'PENDING',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Leave request submitted successfully',
            'data' => $leaveRequest->load(['employee.user', 'leaveType']),
        ], 201);
    }

    /**
     * PATCH /api/v1/hr/leave-requests/{id}/status
     */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:APPROVED,REJECTED,CANCELLED',
            'reviewNotes' => 'nullable|string',
            'reviewedBy' => 'required|integer|exists:users,id',
        ]);

        $leaveRequest = LeaveRequest::with(['employee.user', 'leaveType'])->find($id);

        if (!$leaveRequest) {
            return response()->json(['success' => false, 'error' => 'Leave request not found'], 404);
        }

        if ($leaveRequest->status !== 'PENDING') {
            return response()->json(['success' => false, 'error' => "Cannot update. Current status is {$leaveRequest->status}"], 400);
        }

        $leaveRequest->update([
            'status' => $validated['status'],
            'reviewed_at' => now(),
            'reviewed_by' => $validated['reviewedBy'],
            'review_notes' => $validated['reviewNotes'] ?? null,
        ]);

        if ($validated['status'] === 'APPROVED') {
            $this->syncLeaveWithAttendance($leaveRequest);

            // Update balance
            LeaveBalance::where('employee_id', $leaveRequest->employee_id)
                ->where('year', now()->year)
                ->where('leave_type_id', $leaveRequest->leave_type_id)
                ->update([
                'used' => \DB::raw("used + {$leaveRequest->total_days}"),
                'remaining' => \DB::raw("remaining - {$leaveRequest->total_days}"),
            ]);

            $leaveRequest->update(['attendances_synced' => true]);

            HrNotification::send(
                $leaveRequest->employee_id,
                'LEAVE_APPROVED',
                'Leave Request Approved',
                "Your {$leaveRequest->leaveType->name} request has been approved.",
                "/leaves/{$leaveRequest->id}"
            );
        }
        elseif ($validated['status'] === 'REJECTED') {
            HrNotification::send(
                $leaveRequest->employee_id,
                'LEAVE_REJECTED',
                'Leave Request Rejected',
                "Your {$leaveRequest->leaveType->name} request has been rejected. " . ($validated['reviewNotes'] ?? ''),
                "/leaves/{$leaveRequest->id}"
            );
        }

        return response()->json([
            'success' => true,
            'message' => "Leave request {$validated['status']} successfully",
            'data' => $leaveRequest->fresh(['employee.user', 'leaveType']),
        ]);
    }

    /**
     * GET /api/v1/hr/employees/{id}/leave-balance
     */
    public function balance(string $id): JsonResponse
    {
        $currentYear = now()->year;
        $balances = LeaveBalance::where('employee_id', $id)
            ->where('year', $currentYear)
            ->with('leaveType')
            ->get();

        return response()->json(['success' => true, 'data' => $balances, 'year' => $currentYear]);
    }

    // ─── Private helpers ───

    private function calculateBusinessDays(string $startDate, string $endDate): int
    {
        $count = 0;
        $current = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);

        while ($current->lte($end)) {
            if (!$current->isWeekend()) {
                $count++;
            }
            $current->addDay();
        }

        return $count;
    }

    private function syncLeaveWithAttendance(LeaveRequest $leaveRequest): void
    {
        $current = Carbon::parse($leaveRequest->start_date);
        $end = Carbon::parse($leaveRequest->end_date);

        while ($current->lte($end)) {
            if (!$current->isWeekend()) {
                Attendance::updateOrCreate(
                [
                    'employee_id' => $leaveRequest->employee_id,
                    'attendance_date' => $current->toDateString(),
                ],
                ['status' => 'IZIN']
                );
            }
            $current->addDay();
        }
    }
}