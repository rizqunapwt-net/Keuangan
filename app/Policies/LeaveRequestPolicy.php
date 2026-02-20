<?php

namespace App\Policies;

use App\Models\LeaveRequest;
use App\Models\User;
use App\Policies\Concerns\HandlesRoleAccess;

class LeaveRequestPolicy
{
    use HandlesRoleAccess;

    public function viewAny(User $user): bool
    {
        return $this->hasAnyRole($user, ['Admin', 'Legal']);
    }

    public function view(User $user, LeaveRequest $leaveRequest): bool
    {
        return $this->viewAny($user) || $user->employee?->id === $leaveRequest->employee_id;
    }

    public function create(User $user): bool
    {
        return $user->hasRole('Admin') || $user->hasRole('Karyawan');
    }

    public function update(User $user, LeaveRequest $leaveRequest): bool
    {
        return $user->hasRole('Admin') || ($user->employee?->id === $leaveRequest->employee_id && $leaveRequest->status === 'PENDING');
    }

    public function delete(User $user, LeaveRequest $leaveRequest): bool
    {
        return $user->hasRole('Admin');
    }

    public function approve(User $user, LeaveRequest $leaveRequest): bool
    {
        return $this->hasAnyRole($user, ['Admin', 'Legal']);
    }
}