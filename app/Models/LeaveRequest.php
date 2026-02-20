<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeaveRequest extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'request_number',
        'employee_id',
        'leave_type_id',
        'start_date',
        'end_date',
        'total_days',
        'reason',
        'status',
        'submitted_at',
        'reviewed_at',
        'reviewed_by',
        'review_notes',
        'attachment_url',
        'attendances_synced',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'total_days' => 'integer',
            'submitted_at' => 'datetime',
            'reviewed_at' => 'datetime',
            'attendances_synced' => 'boolean',
        ];
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function leaveType(): BelongsTo
    {
        return $this->belongsTo(LeaveType::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class , 'reviewed_by');
    }

    // ─── Request Number Generator ───

    public static function generateRequestNumber(): string
    {
        $year = now()->year;
        $count = static::where('request_number', 'like', "LV-{$year}%")->count();
        $number = str_pad($count + 1, 4, '0', STR_PAD_LEFT);
        return "LV-{$year}-{$number}";
    }
}