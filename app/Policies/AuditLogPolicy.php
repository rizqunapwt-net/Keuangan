<?php

namespace App\Policies;

use App\Models\AuditLog;
use App\Models\User;
use App\Policies\Concerns\HandlesRoleAccess;

class AuditLogPolicy
{
    use HandlesRoleAccess;

    /**
     * Hanya admin yang bisa melihat audit logs
     */
    public function viewAny(User $user): bool
    {
        return $this->isAdmin($user);
    }

    /**
     * Hanya admin yang bisa melihat detail audit log
     */
    public function view(User $user, AuditLog $auditLog): bool
    {
        return $this->isAdmin($user);
    }

    /**
     * Tidak ada yang bisa membuat audit log manual
     * (Audit log dibuat otomatis oleh sistem)
     */
    public function create(User $user): bool
    {
        return false;
    }

    /**
     * Tidak ada yang bisa mengedit audit log
     */
    public function update(User $user, AuditLog $auditLog): bool
    {
        return false;
    }

    /**
     * Tidak ada yang bisa menghapus audit log
     * (Audit log adalah immutable record)
     */
    public function delete(User $user, AuditLog $auditLog): bool
    {
        return false;
    }

    /**
     * Tidak ada yang bisa force delete audit log
     */
    public function forceDelete(User $user, AuditLog $auditLog): bool
    {
        return false;
    }
}
