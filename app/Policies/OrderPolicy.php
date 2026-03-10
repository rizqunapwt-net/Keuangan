<?php
namespace App\Policies;

use App\Models\Percetakan\Order;
use App\Models\User;
use App\Policies\Concerns\HandlesRoleAccess;

class OrderPolicy
{
    use HandlesRoleAccess;

    public function viewAny(User $user): bool
    {
        return $this->isAdmin($user) || $user->hasPermissionTo('order.view');
    }

    public function view(User $user, Order $order): bool
    {
        return $this->isAdmin($user) || $user->hasPermissionTo('order.view');
    }

    public function create(User $user): bool
    {
        return $this->isAdmin($user) || $user->hasPermissionTo('order.create');
    }

    public function updateStatus(User $user, Order $order): bool
    {
        return $this->isAdmin($user) || $user->hasPermissionTo('order.update_status');
    }
}
