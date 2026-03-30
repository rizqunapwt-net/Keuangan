<?php

namespace App\Policies\Concerns;

use App\Models\User;

trait HandlesRoleAccess
{
    /**
     * Role names as constants for maintainability
     */
    protected const ROLE_ADMIN = 'Admin';

    protected const ROLE_KASIR = 'Kasir';

    /**
     * Check if user has Admin role
     */
    protected function isAdmin(User $user): bool
    {
        return $user->hasRole(static::ROLE_ADMIN);
    }

    /**
     * Check if user has Kasir role
     */
    protected function isKasir(User $user): bool
    {
        return $user->hasRole(static::ROLE_KASIR);
    }

    /**
     * Check if user has any of the specified roles
     */
    protected function hasAnyRole(User $user, array $roles): bool
    {
        return $user->hasAnyRole($roles);
    }
}
