<?php

namespace App\Policies\Concerns;

use App\Models\User;

trait HandlesRoleAccess
{
    protected function hasAnyRole(User $user, array $roles): bool
    {
        return $user->hasRole('Admin') || $user->hasAnyRole($roles);
    }
}
