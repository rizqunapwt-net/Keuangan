<?php

namespace App\Policies;

use App\Models\Employee;
use App\Models\User;
use App\Policies\Concerns\HandlesRoleAccess;

class EmployeePolicy
{
    use HandlesRoleAccess;

    public function viewAny(User $user): bool
    {
        return $this->hasAnyRole($user, ['Admin', 'Legal', 'Finance']);
    }

    public function view(User $user, Employee $employee): bool
    {
        return $this->viewAny($user) || $user->id === $employee->user_id;
    }

    public function create(User $user): bool
    {
        return $user->hasRole('Admin');
    }

    public function update(User $user, Employee $employee): bool
    {
        return $user->hasRole('Admin');
    }

    public function delete(User $user, Employee $employee): bool
    {
        return $user->hasRole('Admin');
    }
}