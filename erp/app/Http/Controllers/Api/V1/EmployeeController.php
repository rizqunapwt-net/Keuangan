<?php

namespace App\Http\Controllers\Api\V1;

use App\Support\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\LeaveBalance;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class EmployeeController extends Controller
{
    use ApiResponse;
    /**
     * GET /api/v1/hr/employees
     */
    public function index(Request $request): JsonResponse
    {
        $query = Employee::with('user:id,username,role,is_active,created_at');

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', fn($u) => $u->where('name', 'like', "%{$search}%")
                ->orWhere('username', 'like', "%{$search}%"))
                    ->orWhere('employee_code', 'like', "%{$search}%");
            });
        }

        if ($role = $request->query('role')) {
            $query->whereHas('user', fn($q) => $q->where('role', $role));
        }

        if ($category = $request->query('category')) {
            $query->where('category', $category);
        }

        $employees = $query->orderBy(
            User::select('name')
            ->whereColumn('users.id', 'employees.user_id')
            ->limit(1),
            'asc'
        )->get();

        // Shape response to match NestJS format
        $data = $employees->map(fn(Employee $emp) => [
            'id' => $emp->id,
            'user_id' => $emp->user_id,
            'employee_code' => $emp->employee_code,
            'name' => $emp->user->name,
            'category' => $emp->category,
            'is_active' => $emp->user->is_active,
            'created_at' => $emp->created_at,
            'updated_at' => $emp->updated_at,
            'user' => $emp->user,
            ]);

        return $this->success($data);
    }

    /**
     * POST /api/v1/hr/employees
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'username' => 'required|string|min:3|max:20|unique:users,username',
            'password' => 'required|string|min:6',
            'name' => 'required|string|min:1',
            'employeeCode' => 'nullable|string',
            'role' => 'in:KARYAWAN,ADMIN,OWNER',
            'category' => 'in:REGULER,MAHASISWA,KEBUN',
            'isActive' => 'boolean',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['username'] . '@rizquna.local',
            'username' => $validated['username'],
            'password' => $validated['password'],
            'role' => $validated['role'] ?? 'KARYAWAN',
            'is_active' => $validated['isActive'] ?? true,
        ]);

        $employee = Employee::create([
            'user_id' => $user->id,
            'employee_code' => $validated['employeeCode'] ?? null,
            'category' => $validated['category'] ?? 'REGULER',
        ]);

        // Initialize leave balances
        $currentYear = now()->year;
        $leaveTypes = \App\Models\LeaveType::where('is_active', true)->get();

        foreach ($leaveTypes as $type) {
            LeaveBalance::create([
                'employee_id' => $employee->id,
                'year' => $currentYear,
                'leave_type_id' => $type->id,
                'total_quota' => $type->max_days,
                'remaining' => $type->max_days,
            ]);
        }

        return $this->success($employee->load('user'), 201, ['message' => 'Karyawan berhasil didaftarkan']);
    }

    /**
     * GET /api/v1/hr/employees/{id}
     */
    public function show(string $id): JsonResponse
    {
        $employee = Employee::with(['user', 'leaveBalances.leaveType'])->find($id);

        if (!$employee) {
            return $this->error('Karyawan tidak ditemukan', 404);
        }

        return $this->success($employee);
    }

    /**
     * PATCH /api/v1/hr/employees/{id}
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $employee = Employee::with('user')->find($id);

        if (!$employee) {
            return $this->error('Karyawan tidak ditemukan', 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|min:1',
            'employeeCode' => 'nullable|string',
            'role' => 'sometimes|in:KARYAWAN,ADMIN,OWNER',
            'category' => 'sometimes|in:REGULER,MAHASISWA,KEBUN',
            'isActive' => 'sometimes|boolean',
            'password' => 'sometimes|string|min:6',
        ]);

        // Update user fields
        $userData = [];
        if (isset($validated['name']))
            $userData['name'] = $validated['name'];
        if (isset($validated['role']))
            $userData['role'] = $validated['role'];
        if (isset($validated['isActive']))
            $userData['is_active'] = $validated['isActive'];
        if (isset($validated['password']))
            $userData['password'] = $validated['password'];

        if (!empty($userData)) {
            $employee->user->update($userData);
        }

        // Update employee fields
        $empData = [];
        if (array_key_exists('employeeCode', $validated))
            $empData['employee_code'] = $validated['employeeCode'];
        if (isset($validated['category']))
            $empData['category'] = $validated['category'];

        if (!empty($empData)) {
            $employee->update($empData);
        }

        return $this->success($employee->fresh('user'), 200, ['message' => 'Data karyawan berhasil diperbarui']);
    }

    /**
     * DELETE /api/v1/hr/employees/{id} (soft delete / deactivate)
     */
    public function destroy(string $id): JsonResponse
    {
        $employee = Employee::find($id);

        if (!$employee) {
            return $this->error('Karyawan tidak ditemukan', 404);
        }

        $employee->user->update(['is_active' => false]);

        return $this->success(null, 200, ['message' => 'Karyawan berhasil dinonaktifkan (Deactivated)']);
    }
}