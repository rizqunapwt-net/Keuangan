<?php

namespace App\Traits;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

trait LogsActivity
{
    /**
     * Record an activity log entry.
     *
     * @param  string  $eventType  e.g. 'created', 'updated', 'deleted', 'status_changed'
     * @param  string  $tableName  e.g. 'debts', 'expenses', 'contacts'
     * @param  string  $description  Human-readable description
     * @param  mixed  $model  The Eloquent model (optional, for polymorphic)
     * @param  array|null  $oldValues  Previous values (for updates)
     * @param  array|null  $newValues  New values (for creates/updates)
     */
    protected function logActivity(
        string $eventType,
        string $tableName,
        string $description,
        $model = null,
        ?array $oldValues = null,
        ?array $newValues = null,
    ): AuditLog {
        return AuditLog::create([
            'user_id' => Auth::id(),
            'event_type' => $eventType,
            'auditable_type' => $model ? get_class($model) : null,
            'auditable_id' => $model?->id ?? null,
            'table_name' => $tableName,
            'description' => $description,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
        ]);
    }
}
