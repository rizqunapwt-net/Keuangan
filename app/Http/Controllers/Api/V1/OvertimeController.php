<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\HrNotification;
use App\Models\OvertimeRequest;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OvertimeController extends Controller
{
    /**
     * GET /api/v1/hr/overtime-requests
     */
    public function index(Request $request): JsonResponse
    {
        $query = OvertimeRequest::with(['employee.user', 'approver']);

        if ($employeeId = $request->query('employeeId')) {
            $query->where('employee_id', $employeeId);
        }
        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $requests = $query->orderByDesc('submitted_at')->get();

        return response()->json(['success' => true, 'data' => $requests]);
    }

    /**
     * POST /api/v1/hr/overtime-requests
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'employeeId' => 'required|uuid|exists:employees,id',
            'overtimeDate' => 'required|date',
            'startTime' => 'required|date',
            'endTime' => 'required|date|after:startTime',
            'reason' => 'required|string|min:10',
        ]);

        // Verify attendance record exists
        $attendance = Attendance::where('employee_id', $validated['employeeId'])
            ->whereDate('attendance_date', $validated['overtimeDate'])
            ->first();

        if (!$attendance) {
            return response()->json([
                'success' => false,
                'error' => 'Attendance record required',
                'message' => 'Anda harus memiliki catatan kehadiran pada tanggal tersebut sebelum mengajukan lembur.',
            ], 400);
        }

        $startTime = Carbon::parse($validated['startTime']);
        $endTime = Carbon::parse($validated['endTime']);
        $totalHours = max(0, $endTime->diffInMinutes($startTime) / 60);

        $overtime = OvertimeRequest::create([
            'request_number' => OvertimeRequest::generateRequestNumber(),
            'employee_id' => $validated['employeeId'],
            'overtime_date' => $validated['overtimeDate'],
            'start_time' => $startTime,
            'end_time' => $endTime,
            'total_hours' => $totalHours,
            'reason' => $validated['reason'],
            'status' => 'PENDING',
            'attendance_id' => $attendance->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Permintaan lembur berhasil diajukan',
            'data' => $overtime->load('employee.user'),
        ], 201);
    }

    /**
     * PATCH /api/v1/hr/overtime-requests/{id}/status
     */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:APPROVED,REJECTED',
            'reviewNotes' => 'nullable|string',
            'reviewedBy' => 'required|integer|exists:users,id',
        ]);

        $overtime = OvertimeRequest::find($id);

        if (!$overtime) {
            return response()->json(['success' => false, 'error' => 'Permintaan lembur tidak ditemukan'], 404);
        }

        if ($overtime->status !== 'PENDING') {
            return response()->json(['success' => false, 'error' => "Status tidak dapat diubah. Status saat ini: {$overtime->status}"], 400);
        }

        $overtime->update([
            'status' => $validated['status'],
            'reviewed_at' => now(),
            'reviewed_by' => $validated['reviewedBy'],
            'review_notes' => $validated['reviewNotes'] ?? null,
        ]);

        HrNotification::send(
            $overtime->employee_id,
            $validated['status'] === 'APPROVED' ? 'OVERTIME_APPROVED' : 'OVERTIME_REJECTED',
            $validated['status'] === 'APPROVED' ? 'Lembur Disetujui' : 'Lembur Ditolak',
            $validated['status'] === 'APPROVED'
            ? "Permintaan lembur tanggal {$overtime->overtime_date->format('d/m/Y')} telah disetujui."
            : "Permintaan lembur tanggal {$overtime->overtime_date->format('d/m/Y')} ditolak. " . ($validated['reviewNotes'] ?? ''),
            '/overtime'
        );

        return response()->json([
            'success' => true,
            'message' => 'Permintaan lembur berhasil di' . ($validated['status'] === 'APPROVED' ? 'setujui' : 'tolak'),
            'data' => $overtime->fresh('employee.user'),
        ]);
    }
}