<?php

namespace App\Policies;

use App\Models\Accounting\Account;
use App\Models\User;
use App\Policies\Concerns\HandlesRoleAccess;

class AccountPolicy
{
    use HandlesRoleAccess;

    public function viewAny(User $user): bool
    {
        return $this->isAdmin($user) || $user->hasPermissionTo('accounting_read');
    }

    public function view(User $user, Account $account): bool
    {
        return $this->isAdmin($user) || $user->hasPermissionTo('accounting_read');
    }

    public function create(User $user): bool
    {
        return $this->isAdmin($user) || $user->hasPermissionTo('accounting_write');
    }

    public function update(User $user, Account $account): bool
    {
        return $this->isAdmin($user) || $user->hasPermissionTo('accounting_write');
    }

    public function delete(User $user, Account $account): bool
    {
        return $this->isAdmin($user) || $user->hasPermissionTo('accounting_write');
    }
}
