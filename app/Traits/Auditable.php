<?php

namespace App\Traits;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Trait Auditable
 *
 * Trait untuk menambahkan audit logging pada controller.
 * Digunakan untuk mencatat setiap aktivitas sensitif seperti:
 * - Delete transaksi
 * - Void transaksi
 * - Perubahan saldo
 * - Modifikasi data kritis
 */
trait Auditable
{
    /**
     * Log audit untuk aksi delete
     */
    protected function logDelete(
        Model $model,
        ?string $description = null,
        ?array $oldValues = null
    ): AuditLog {
        return $this->logAudit(
            eventType: AuditLog::EVENT_DELETED,
            model: $model,
            description: $description ?? "Data {$model->getTable()} dengan ID {$model->id} telah dihapus",
            oldValues: $oldValues ?? $model->toArray()
        );
    }

    /**
     * Log audit untuk aksi void
     */
    protected function logVoid(
        Model $model,
        ?string $reason = null,
        ?array $oldValues = null
    ): AuditLog {
        return $this->logAudit(
            eventType: AuditLog::EVENT_VOIDED,
            model: $model,
            description: $reason ?? "Transaksi {$model->getTable()} dengan ID {$model->id} telah di-void",
            oldValues: $oldValues ?? $model->toArray()
        );
    }

    /**
     * Log audit untuk perubahan saldo
     */
    protected function logBalanceChange(
        Model $model,
        float $oldBalance,
        float $newBalance,
        string $description
    ): AuditLog {
        return $this->logAudit(
            eventType: AuditLog::EVENT_BALANCE_CHANGED,
            model: $model,
            description: $description,
            oldValues: ['balance' => $oldBalance],
            newValues: ['balance' => $newBalance]
        );
    }

    /**
     * Log audit untuk modifikasi data
     */
    protected function logModification(
        Model $model,
        array $oldValues,
        array $newValues,
        string $description
    ): AuditLog {
        return $this->logAudit(
            eventType: AuditLog::EVENT_DATA_MODIFIED,
            model: $model,
            description: $description,
            oldValues: $oldValues,
            newValues: $newValues
        );
    }

    /**
     * Log audit untuk akses tidak terotorisasi
     */
    protected function logUnauthorizedAccess(
        string $resource,
        string $description
    ): AuditLog {
        return AuditLog::create([
            'user_id' => Auth::id(),
            'event_type' => AuditLog::EVENT_UNAUTHORIZED_ACCESS,
            // Keep non-null contract with audit_logs schema.
            'auditable_type' => 'security_event',
            'auditable_id' => 0,
            'table_name' => $resource,
            'description' => $description,
            'old_values' => null,
            'new_values' => null,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }

    /**
     * Core method untuk membuat audit log entry
     */
    private function logAudit(
        string $eventType,
        Model $model,
        string $description,
        ?array $oldValues = null,
        ?array $newValues = null
    ): AuditLog {
        return AuditLog::create([
            'user_id' => Auth::id(),
            'event_type' => $eventType,
            'auditable_type' => get_class($model),
            'auditable_id' => $model->id,
            'table_name' => $model->getTable(),
            'description' => $description,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }

    /**
     * Get request from container (for Laravel 11+ compatibility)
     */
    protected function getRequest(): Request
    {
        return app('request');
    }
}
