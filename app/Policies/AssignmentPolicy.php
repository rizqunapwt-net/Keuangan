<?php

namespace App\Policies;

use App\Models\Assignment;
use App\Models\User;
use App\Policies\Concerns\HandlesRoleAccess;

class AssignmentPolicy
{
    use HandlesRoleAccess;

    public function viewAny(User $user): bool { return $this->hasAnyRole($user, ['Legal', 'Marketing', 'Finance']); }
    public function view(User $user, Assignment $assignment): bool { return $this->viewAny($user); }
    public function create(User $user): bool { return $this->hasAnyRole($user, ['Marketing']); }
    public function update(User $user, Assignment $assignment): bool { return $this->hasAnyRole($user, ['Marketing']); }
    public function delete(User $user, Assignment $assignment): bool { return $user->hasRole('Admin') || $user->hasRole('Marketing'); }
    public function deleteAny(User $user): bool { return $user->hasRole('Admin'); }
    public function forceDelete(User $user, Assignment $assignment): bool { return false; }
    public function forceDeleteAny(User $user): bool { return false; }
    public function restore(User $user, Assignment $assignment): bool { return false; }
    public function restoreAny(User $user): bool { return false; }
    public function replicate(User $user, Assignment $assignment): bool { return false; }
    public function reorder(User $user): bool { return false; }
}
