<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * AuditLog Model
 * 
 * Mencatat setiap aktivitas sensitif untuk keperluan security audit.
 */
class AuditLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'event_type',
        'auditable_type',
        'auditable_id',
        'table_name',
        'description',
        'old_values',
        'new_values',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
        'created_at' => 'datetime',
    ];

    /**
     * User yang melakukan aksi
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Model yang diaudit (polymorphic)
     */
    public function auditable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Scope untuk filter oleh event type
     */
    public function scopeOfType($query, string $eventType)
    {
        return $query->where('event_type', $eventType);
    }

    /**
     * Scope untuk filter oleh user
     */
    public function scopeByUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope untuk filter oleh tanggal
     */
    public function scopeForDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    /**
     * Event types constants
     */
    public const EVENT_DELETED = 'deleted';
    public const EVENT_VOIDED = 'voided';
    public const EVENT_BALANCE_CHANGED = 'balance_changed';
    public const EVENT_UNAUTHORIZED_ACCESS = 'unauthorized_access';
    public const EVENT_DATA_MODIFIED = 'data_modified';
    public const EVENT_EXPORT_DATA = 'export_data';
}
