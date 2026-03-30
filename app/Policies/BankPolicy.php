<?php

namespace App\Policies;

use App\Models\Bank;
use App\Models\User;
use App\Policies\Concerns\HandlesRoleAccess;

class BankPolicy
{
    use HandlesRoleAccess;

    public function viewAny(User $user): bool
    {
        return $this->isAdmin($user) || $user->hasPermissionTo('bank.view');
    }

    public function view(User $user, Bank $bank): bool
    {
        return $this->isAdmin($user) || $user->hasPermissionTo('bank.view');
    }

    public function create(User $user): bool
    {
        return $this->isAdmin($user) || $user->hasPermissionTo('bank.create');
    }

    public function update(User $user, Bank $bank): bool
    {
        return $this->isAdmin($user) || $user->hasPermissionTo('bank.update');
    }

    public function delete(User $user, Bank $bank): bool
    {
        return $this->isAdmin($user) || $user->hasPermissionTo('bank.delete');
    }

    public function transfer(User $user): bool
    {
        return $this->isAdmin($user) || $user->hasPermissionTo('bank.transfer');
    }

    public function reconcile(User $user): bool
    {
        return $this->isAdmin($user) || $user->hasPermissionTo('bank.reconcile');
    }
}
