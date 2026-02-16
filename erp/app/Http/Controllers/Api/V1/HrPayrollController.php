<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Employee;
use App\Models\HrNotification;
use App\Models\OvertimeRequest;
use App\Models\Payroll;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HrPayrollController extends Controller
{
    /**
     * GET /api/v1/hr/payrolls
     */
    public function index(Request $request): JsonResponse
    {
        $query = Payroll::query()->with('employee.user')
            ->when($request->query('employeeId'), fn($q, $id) => $q->where('employee_id', $id))
            ->when($request->query('month'), fn($q, $m) => $q->where('month', (int)$m))
            ->when($request->query('year'), fn($q, $y) => $q->where('year', (int)$y));

        $payrolls = $query->orderByDesc('year')->orderByDesc('month')->get();

        return response()->json(['success' => true, 'data' => $payrolls]);
    }

    /**
     * POST /api/v1/hr/payrolls/generate (ADMIN only)
     */
    public function generate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'month' => 'required|integer|min:1|max:12',
            'year' => 'required|integer|min:2024',
            'employeeIds' => 'nullable|array',
            'employeeIds.*' => 'uuid|exists:employees,id',
        ]);

        $month = $validated['month'];
        $year = $validated['year'];

        $query = Employee::with('user');
        if (!empty($validated['employeeIds'])) {
            $query->whereIn('id', $validated['employeeIds']);
        }
        $employees = $query->get();

        $businessDays = $this->calculateBusinessDays($month, $year);
        $results = [];

        foreach ($employees as $employee) {
            $startOfMonth = \Carbon\Carbon::create($year, $month, 1)->startOfDay();
            $endOfMonth = $startOfMonth->copy()->endOfMonth();

            // Attendance
            $attendanceRecords = Attendance::where('employee_id', $employee->id)
                ->whereBetween('attendance_date', [$startOfMonth, $endOfMonth])
                ->get();

            $attendanceDays = $attendanceRecords->whereIn('status', ['HADIR', 'WFH'])->count();
            $lateCount = $attendanceRecords->where('late_minutes', '>', 0)->count();

            // Overtime
            $totalOvertimeHours = OvertimeRequest::where('employee_id', $employee->id)
                ->whereBetween('overtime_date', [$startOfMonth, $endOfMonth])
                ->where('status', 'APPROVED')
                ->sum('total_hours');

            // Calculation
            $baseSalary = (float)($employee->base_salary ?: 5000000);
            $dailySalary = $businessDays > 0 ? $baseSalary / $businessDays : 0;
            $hourlyRate = $baseSalary / 173;
            $overtimePay = $totalOvertimeHours * $hourlyRate * 1.5;
            $lateDeduction = $lateCount * 50000;
            $grossPay = ($dailySalary * $attendanceDays) + $overtimePay;
            $netPay = $grossPay - $lateDeduction;

            $payroll = Payroll::updateOrCreate(
            [
                'employee_id' => $employee->id,
                'month' => $month,
                'year' => $year,
            ],
            [
                'payroll_number' => Payroll::generatePayrollNumber(),
                'base_salary' => $baseSalary,
                'attendance_days' => $attendanceDays,
                'daily_salary' => $dailySalary,
                'overtime_hours' => $totalOvertimeHours,
                'overtime_pay' => $overtimePay,
                'late_deduction' => $lateDeduction,
                'absent_deduction' => max(0, $businessDays - $attendanceDays) * $dailySalary,
                'gross_pay' => $grossPay,
                'net_pay' => $netPay,
            ]
            );

            HrNotification::send(
                $employee->id,
                'PAYROLL_GENERATED',
                'Slip Gaji Diterbitkan',
                "Slip gaji Anda untuk periode {$month}/{$year} telah tersedia.",
                '/payroll'
            );

            $results[] = $payroll;
        }

        return response()->json([
            'success' => true,
            'message' => "Berhasil menghasilkan " . count($results) . " slip gaji",
            'data' => $results,
        ]);
    }

    private function calculateBusinessDays(int $month, int $year): int
    {
        $lastDay = \Carbon\Carbon::create($year, $month)->daysInMonth;
        $count = 0;
        for ($day = 1; $day <= $lastDay; $day++) {
            $date = \Carbon\Carbon::create($year, $month, $day);
            if (!$date->isWeekend()) {
                $count++;
            }
        }
        return $count;
    }
}