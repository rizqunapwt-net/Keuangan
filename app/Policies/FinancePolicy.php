<?php

namespace App\Policies;

use App\Models\User;
use App\Policies\Concerns\HandlesRoleAccess;

class FinancePolicy
{
    use HandlesRoleAccess;

    public function viewReports(User $user): bool
    {
        return $this->isAdmin($user) || $user->hasPermissionTo('finance.view_reports') || $user->hasPermissionTo('reports_read');
    }

    public function manageAccounts(User $user): bool
    {
        return $this->isAdmin($user) || $user->hasPermissionTo('finance.manage_accounts');
    }
}
