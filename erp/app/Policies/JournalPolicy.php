<?php

namespace App\Policies;

use App\Models\Accounting\Journal;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class JournalPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('accounting.manage');
    }

    public function view(User $user, Journal $journal): bool
    {
        return $user->hasPermissionTo('accounting.manage');
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('accounting.manage');
    }

    public function update(User $user, Journal $journal): bool
    {
        // Typically, journals should not be editable if they are "posted"
        // but for now we follow the same permission
        return $user->hasPermissionTo('accounting.manage') && $journal->status !== 'posted';
    }

    public function delete(User $user, Journal $journal): bool
    {
        return $user->hasPermissionTo('accounting.manage') && $journal->status !== 'posted';
    }
}