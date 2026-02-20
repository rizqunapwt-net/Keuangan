<?php

namespace App\Policies;

use App\Models\User;
use App\Policies\Concerns\HandlesRoleAccess;

class UserPolicy
{
    use HandlesRoleAccess;

    public function viewAny(User $user): bool
    {
        return $user->hasRole('Admin');
    }

    public function view(User $user, User $model): bool
    {
        return $user->hasRole('Admin') || $user->id === $model->id;
    }

    public function create(User $user): bool
    {
        return $user->hasRole('Admin');
    }

    public function update(User $user, User $model): bool
    {
        return $user->hasRole('Admin');
    }

    public function delete(User $user, User $model): bool
    {
        return $user->hasRole('Admin') && $user->id !== $model->id;
    }
}