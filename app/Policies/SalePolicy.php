<?php

namespace App\Policies;

use App\Models\Sale;
use App\Models\User;
use App\Policies\Concerns\HandlesRoleAccess;

class SalePolicy
{
    use HandlesRoleAccess;

    public function viewAny(User $user): bool { return $this->hasAnyRole($user, ['Legal', 'Marketing', 'Finance']); }
    public function view(User $user, Sale $sale): bool { return $this->viewAny($user); }
    public function create(User $user): bool { return $this->hasAnyRole($user, ['Finance']); }
    public function update(User $user, Sale $sale): bool { return $this->hasAnyRole($user, ['Finance']); }
    public function delete(User $user, Sale $sale): bool { return $user->hasRole('Admin') || $user->hasRole('Finance'); }
    public function deleteAny(User $user): bool { return $user->hasRole('Admin') || $user->hasRole('Finance'); }
    public function forceDelete(User $user, Sale $sale): bool { return false; }
    public function forceDeleteAny(User $user): bool { return false; }
    public function restore(User $user, Sale $sale): bool { return false; }
    public function restoreAny(User $user): bool { return false; }
    public function replicate(User $user, Sale $sale): bool { return false; }
    public function reorder(User $user): bool { return false; }
}
