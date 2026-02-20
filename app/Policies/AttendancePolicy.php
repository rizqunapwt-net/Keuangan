<?php

namespace App\Policies;

use App\Models\Attendance;
use App\Models\User;
use App\Policies\Concerns\HandlesRoleAccess;

class AttendancePolicy
{
    use HandlesRoleAccess;

    public function viewAny(User $user): bool
    {
        return $this->hasAnyRole($user, ['Admin', 'Finance']);
    }

    public function view(User $user, Attendance $attendance): bool
    {
        return $this->viewAny($user) || $user->employee?->id === $attendance->employee_id;
    }

    public function create(User $user): bool
    {
        return $user->hasRole('Admin') || $user->hasRole('Karyawan');
    }

    public function update(User $user, Attendance $attendance): bool
    {
        return $user->hasRole('Admin');
    }

    public function delete(User $user, Attendance $attendance): bool
    {
        return $user->hasRole('Admin');
    }
}