<?php

namespace App\Policies;

use App\Models\Marketplace;
use App\Models\User;
use App\Policies\Concerns\HandlesRoleAccess;

class MarketplacePolicy
{
    use HandlesRoleAccess;

    public function viewAny(User $user): bool { return $this->hasAnyRole($user, ['Legal', 'Marketing', 'Finance']); }
    public function view(User $user, Marketplace $marketplace): bool { return $this->viewAny($user); }
    public function create(User $user): bool { return $this->hasAnyRole($user, ['Marketing']); }
    public function update(User $user, Marketplace $marketplace): bool { return $this->hasAnyRole($user, ['Marketing']); }
    public function delete(User $user, Marketplace $marketplace): bool { return $user->hasRole('Admin'); }
    public function deleteAny(User $user): bool { return $user->hasRole('Admin'); }
    public function forceDelete(User $user, Marketplace $marketplace): bool { return false; }
    public function forceDeleteAny(User $user): bool { return false; }
    public function restore(User $user, Marketplace $marketplace): bool { return false; }
    public function restoreAny(User $user): bool { return false; }
    public function replicate(User $user, Marketplace $marketplace): bool { return false; }
    public function reorder(User $user): bool { return false; }
}
