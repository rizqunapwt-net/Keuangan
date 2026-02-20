<?php

namespace App\Policies;

use App\Models\Payment;
use App\Models\User;
use App\Policies\Concerns\HandlesRoleAccess;

class PaymentPolicy
{
    use HandlesRoleAccess;

    public function viewAny(User $user): bool { return $this->hasAnyRole($user, ['Legal', 'Finance']); }
    public function view(User $user, Payment $payment): bool { return $this->viewAny($user); }
    public function create(User $user): bool { return $this->hasAnyRole($user, ['Finance']); }
    public function update(User $user, Payment $payment): bool { return $this->hasAnyRole($user, ['Finance']); }
    public function delete(User $user, Payment $payment): bool { return $user->hasRole('Admin') || $user->hasRole('Finance'); }
    public function deleteAny(User $user): bool { return $user->hasRole('Admin') || $user->hasRole('Finance'); }
    public function forceDelete(User $user, Payment $payment): bool { return false; }
    public function forceDeleteAny(User $user): bool { return false; }
    public function restore(User $user, Payment $payment): bool { return false; }
    public function restoreAny(User $user): bool { return false; }
    public function replicate(User $user, Payment $payment): bool { return false; }
    public function reorder(User $user): bool { return false; }
}
