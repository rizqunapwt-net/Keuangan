<?php

namespace App\Policies;

use App\Models\Author;
use App\Models\User;
use App\Policies\Concerns\HandlesRoleAccess;

class AuthorPolicy
{
    use HandlesRoleAccess;

    public function viewAny(User $user): bool { return $this->hasAnyRole($user, ['Legal', 'Marketing', 'Finance']); }
    public function view(User $user, Author $author): bool { return $this->viewAny($user); }
    public function create(User $user): bool { return $this->hasAnyRole($user, ['Legal', 'Finance']); }
    public function update(User $user, Author $author): bool { return $this->hasAnyRole($user, ['Legal', 'Finance']); }
    public function delete(User $user, Author $author): bool { return $user->hasRole('Admin'); }
    public function deleteAny(User $user): bool { return $user->hasRole('Admin'); }
    public function forceDelete(User $user, Author $author): bool { return false; }
    public function forceDeleteAny(User $user): bool { return false; }
    public function restore(User $user, Author $author): bool { return false; }
    public function restoreAny(User $user): bool { return false; }
    public function replicate(User $user, Author $author): bool { return false; }
    public function reorder(User $user): bool { return $user->hasRole('Admin'); }
}
