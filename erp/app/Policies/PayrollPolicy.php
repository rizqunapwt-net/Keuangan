<?php

namespace App\Policies;

use App\Models\Payroll;
use App\Models\User;
use App\Policies\Concerns\HandlesRoleAccess;

class PayrollPolicy
{
    use HandlesRoleAccess;

    public function viewAny(User $user): bool
    {
        return $this->hasAnyRole($user, ['Admin', 'Finance']);
    }

    public function view(User $user, Payroll $payroll): bool
    {
        return $this->viewAny($user) || $user->employee?->id === $payroll->employee_id;
    }

    public function create(User $user): bool
    {
        return $this->hasAnyRole($user, ['Admin', 'Finance']);
    }

    public function update(User $user, Payroll $payroll): bool
    {
        return $this->hasAnyRole($user, ['Admin', 'Finance']);
    }

    public function delete(User $user, Payroll $payroll): bool
    {
        return $user->hasRole('Admin');
    }
}