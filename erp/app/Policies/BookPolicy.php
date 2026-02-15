<?php

namespace App\Policies;

use App\Models\Book;
use App\Models\User;
use App\Policies\Concerns\HandlesRoleAccess;

class BookPolicy
{
    use HandlesRoleAccess;

    public function viewAny(User $user): bool { return $this->hasAnyRole($user, ['Legal', 'Marketing', 'Finance']); }
    public function view(User $user, Book $book): bool { return $this->viewAny($user); }
    public function create(User $user): bool { return $this->hasAnyRole($user, ['Legal', 'Marketing']); }
    public function update(User $user, Book $book): bool { return $this->hasAnyRole($user, ['Legal', 'Marketing']); }
    public function delete(User $user, Book $book): bool { return $user->hasRole('Admin'); }
    public function deleteAny(User $user): bool { return $user->hasRole('Admin'); }
    public function forceDelete(User $user, Book $book): bool { return false; }
    public function forceDeleteAny(User $user): bool { return false; }
    public function restore(User $user, Book $book): bool { return false; }
    public function restoreAny(User $user): bool { return false; }
    public function replicate(User $user, Book $book): bool { return false; }
    public function reorder(User $user): bool { return $user->hasRole('Admin'); }
}
