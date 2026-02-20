<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\AttendanceCorrection;
use App\Models\Employee;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    /**
     * GET /api/v1/hr/attendance/status
     */
    public function status(Request $request): JsonResponse
    {
        $employee = Employee::where('user_id', $request->user()->id)->first();

        if (! $employee) {
            return response()->json(['status' => 'NOT_EMPLOYEE']);
        }

        $today = now()->startOfDay();
        $attendance = Attendance::where('employee_id', $employee->id)
            ->where('attendance_date', '>=', $today)
            ->first();

        if (! $attendance) {
            return response()->json(['status' => 'NOT_CHECKED_IN']);
        }

        if ($attendance->check_out_time) {
            return response()->json(['status' => 'CHECKED_OUT', 'data' => $attendance]);
        }

        return response()->json(['status' => 'CHECKED_IN', 'data' => $attendance]);
    }

    /**
     * GET /api/v1/hr/attendance/history
     */
    public function history(Request $request): JsonResponse
    {
        $employee = Employee::where('user_id', $request->user()->id)->first();

        if (! $employee) {
            return response()->json(['message' => 'Employee not found'], 404);
        }

        $history = Attendance::where('employee_id', $employee->id)
            ->where('attendance_date', '>=', now()->subDays(30))
            ->orderByDesc('attendance_date')
            ->get();

        return response()->json($history);
    }

    /**
     * GET /api/v1/hr/attendance/summary (ADMIN only)
     */
    public function summary(Request $request): JsonResponse
    {
        $dateStr = $request->query('date', now()->toDateString());
        $date = \Carbon\Carbon::parse($dateStr);

        $attendances = Attendance::with('employee')
            ->whereDate('attendance_date', $date)
            ->get();

        $employees = Employee::where('user_id', '>', 0)
            ->with('user')
            ->get();

        $summary = $employees->map(function ($emp) use ($attendances) {
            $att = $attendances->firstWhere('employee_id', $emp->id);
            return [
                'id' => $emp->id,
                'name' => $emp->user->name,
                'employee_code' => $emp->employee_code,
                'category' => $emp->category,
                'status' => $att ? $att->status : 'ABSEN',
                'check_in' => $att?->check_in_time,
                'check_out' => $att?->check_out_time,
                'late_minutes' => $att?->late_minutes ?? 0,
            ];
        });

        return response()->json(['date' => $dateStr, 'summary' => $summary]);
    }

    /**
     * POST /api/v1/hr/attendance/check-in
     */
    public function checkIn(Request $request): JsonResponse
    {
        $employee = Employee::where('user_id', $request->user()->id)
            ->first();

        if (! $employee) {
            return response()->json(['message' => 'Employee record not found'], 404);
        }

        // Validate based on employee category
        $this->validateCategory($employee->category, $request);

        $attendanceDate = $request->input('attendance_date', now()->toDateString());
        $date = \Carbon\Carbon::parse($attendanceDate)->startOfDay();

        $existing = Attendance::where('employee_id', $employee->id)
            ->whereDate('attendance_date', $date)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'Already checked in for this date'], 400);
        }

        $attendance = Attendance::create([
            'employee_id' => $employee->id,
            'attendance_date' => $date,
            'check_in_time' => now(),
            'check_in_location' => $request->input('location'),
            'check_in_photo' => $request->input('photo'),
            'status' => 'HADIR',
        ]);

        return response()->json($attendance, 201);
    }

    /**
     * POST /api/v1/hr/attendance/check-out
     */
    public function checkOut(Request $request): JsonResponse
    {
        $employee = Employee::where('user_id', $request->user()->id)
            ->first();

        if (! $employee) {
            return response()->json(['message' => 'Employee record not found'], 404);
        }

        $this->validateCategory($employee->category, $request);

        $attendanceDate = $request->input('attendance_date', now()->toDateString());
        $date = \Carbon\Carbon::parse($attendanceDate)->startOfDay();

        $attendance = Attendance::where('employee_id', $employee->id)
            ->whereDate('attendance_date', $date)
            ->first();

        if (! $attendance) {
            return response()->json(['message' => 'Check-in not found'], 404);
        }

        if ($attendance->check_out_time) {
            return response()->json(['message' => 'Already checked out'], 400);
        }

        $attendance->update([
            'check_out_time' => now(),
            'check_out_location' => $request->input('location'),
            'check_out_photo' => $request->input('photo'),
        ]);

        return response()->json($attendance);
    }

    /**
     * PUT /api/v1/hr/attendance/{id}/correct (ADMIN only)
     */
    public function correct(Request $request, string $id): JsonResponse
    {
        // Whitelist of fields that can be corrected
        $allowedFields = [
            'check_in_time',
            'check_out_time',
            'check_in_location',
            'check_out_location',
            'status',
        ];

        $request->validate([
            'field_name' => ['required', 'string', 'in:' . implode(',', $allowedFields)],
            'after_value' => 'required',
            'reason' => 'required|string',
        ]);

        $attendance = Attendance::find($id);
        if (! $attendance) {
            return response()->json(['message' => 'Attendance not found'], 404);
        }

        AttendanceCorrection::create([
            'attendance_id' => $id,
            'corrected_by_user_id' => $request->user()->id,
            'field_name' => $request->field_name,
            'before_value' => (string) ($attendance->{$request->field_name} ?? ''),
            'after_value' => (string) $request->after_value,
            'reason' => $request->reason,
        ]);

        $attendance->update([$request->field_name => $request->after_value]);

        return response()->json(['ok' => true]);
    }

    // ─── Private ───

    private function validateCategory(string $category, Request $request): void
    {
        if ($category === 'KEBUN') {
            if (! $request->input('location')) {
                abort(400, 'Location is required for KEBUN check-in/out');
            }
            if (! $request->input('photo')) {
                abort(400, 'Photo is required for KEBUN check-in/out');
            }
        }
    }
}