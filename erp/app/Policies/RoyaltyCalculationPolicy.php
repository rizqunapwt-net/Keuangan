<?php

namespace App\Policies;

use App\Models\RoyaltyCalculation;
use App\Models\User;
use App\Policies\Concerns\HandlesRoleAccess;

class RoyaltyCalculationPolicy
{
    use HandlesRoleAccess;

    public function viewAny(User $user): bool { return $this->hasAnyRole($user, ['Legal', 'Finance']); }
    public function view(User $user, RoyaltyCalculation $royaltyCalculation): bool { return $this->viewAny($user); }
    public function create(User $user): bool { return $this->hasAnyRole($user, ['Finance']); }
    public function update(User $user, RoyaltyCalculation $royaltyCalculation): bool { return $this->hasAnyRole($user, ['Finance']); }
    public function delete(User $user, RoyaltyCalculation $royaltyCalculation): bool { return $user->hasRole('Admin') || $user->hasRole('Finance'); }
    public function deleteAny(User $user): bool { return $user->hasRole('Admin') || $user->hasRole('Finance'); }
    public function forceDelete(User $user, RoyaltyCalculation $royaltyCalculation): bool { return false; }
    public function forceDeleteAny(User $user): bool { return false; }
    public function restore(User $user, RoyaltyCalculation $royaltyCalculation): bool { return false; }
    public function restoreAny(User $user): bool { return false; }
    public function replicate(User $user, RoyaltyCalculation $royaltyCalculation): bool { return false; }
    public function reorder(User $user): bool { return false; }
}
