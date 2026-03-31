<?php

namespace App\Policies;

use App\Models\Debt;
use App\Models\User;
use App\Policies\Concerns\HandlesRoleAccess;

class DebtPolicy
{
    use HandlesRoleAccess;

    public function viewAny(User $user): bool
    {
        return $this->isAdmin($user) || $user->hasPermissionTo('debt.view');
    }

    public function view(User $user, Debt $debt): bool
    {
        return $this->isAdmin($user) || $user->hasPermissionTo('debt.view');
    }

    public function create(User $user): bool
    {
        return $this->isAdmin($user) || $user->hasPermissionTo('debt.create');
    }

    public function update(User $user, Debt $debt): bool
    {
        return $this->isAdmin($user) || $user->hasPermissionTo('debt.edit');
    }

    public function delete(User $user, Debt $debt): bool
    {
        return $this->isAdmin($user) || $user->hasPermissionTo('debt.delete');
    }

    public function recordPayment(User $user, Debt $debt): bool
    {
        return $this->isAdmin($user) || $user->hasPermissionTo('debt.record_payment');
    }
}
