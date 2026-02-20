<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OvertimeRequest extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'request_number',
        'employee_id',
        'overtime_date',
        'start_time',
        'end_time',
        'total_hours',
        'reason',
        'status',
        'submitted_at',
        'reviewed_at',
        'reviewed_by',
        'review_notes',
        'attendance_id',
    ];

    protected function casts(): array
    {
        return [
            'overtime_date' => 'date',
            'start_time' => 'datetime',
            'end_time' => 'datetime',
            'total_hours' => 'decimal:2',
            'submitted_at' => 'datetime',
            'reviewed_at' => 'datetime',
        ];
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function attendance(): BelongsTo
    {
        return $this->belongsTo(Attendance::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class , 'reviewed_by');
    }

    public static function generateRequestNumber(): string
    {
        $year = now()->year;
        $count = static::where('request_number', 'like', "OT-{$year}%")->count();
        $number = str_pad($count + 1, 4, '0', STR_PAD_LEFT);
        return "OT-{$year}-{$number}";
    }
}