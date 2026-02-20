<?php

namespace App\Policies;

use App\Models\Contract;
use App\Models\User;
use App\Policies\Concerns\HandlesRoleAccess;

class ContractPolicy
{
    use HandlesRoleAccess;

    public function viewAny(User $user): bool { return $this->hasAnyRole($user, ['Legal', 'Finance', 'Marketing']); }
    public function view(User $user, Contract $contract): bool { return $this->viewAny($user); }
    public function create(User $user): bool { return $this->hasAnyRole($user, ['Legal']); }
    public function update(User $user, Contract $contract): bool { return $this->hasAnyRole($user, ['Legal']); }
    public function delete(User $user, Contract $contract): bool { return $user->hasRole('Admin'); }
    public function deleteAny(User $user): bool { return $user->hasRole('Admin'); }
    public function forceDelete(User $user, Contract $contract): bool { return false; }
    public function forceDeleteAny(User $user): bool { return false; }
    public function restore(User $user, Contract $contract): bool { return false; }
    public function restoreAny(User $user): bool { return false; }
    public function replicate(User $user, Contract $contract): bool { return false; }
    public function reorder(User $user): bool { return false; }
}
