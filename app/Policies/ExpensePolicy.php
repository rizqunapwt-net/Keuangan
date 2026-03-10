<?php
namespace App\Policies;

use App\Models\Expense;
use App\Models\User;
use App\Policies\Concerns\HandlesRoleAccess;

class ExpensePolicy
{
    use HandlesRoleAccess;

    public function viewAny(User $user): bool
    {
        return $this->isAdmin($user) || $user->hasPermissionTo('expense.view');
    }

    public function view(User $user, Expense $expense): bool
    {
        return $this->isAdmin($user) || $user->hasPermissionTo('expense.view');
    }

    public function create(User $user): bool
    {
        return $this->isAdmin($user) || $user->hasPermissionTo('expense.create');
    }

    public function update(User $user, Expense $expense): bool
    {
        return $this->isAdmin($user) || $user->hasPermissionTo('expense.update');
    }

    public function delete(User $user, Expense $expense): bool
    {
        return $this->isAdmin($user) || $user->hasPermissionTo('expense.delete');
    }

    public function approve(User $user, Expense $expense): bool
    {
        return $this->isAdmin($user) || $user->hasPermissionTo('expense.approve');
    }

    public function void(User $user, Expense $expense): bool
    {
        return $this->isAdmin($user) || $user->hasPermissionTo('expense.void');
    }
}
