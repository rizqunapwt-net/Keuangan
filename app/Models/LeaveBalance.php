<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeaveBalance extends Model
{
    use HasUuids;

    protected $fillable = [
        'employee_id',
        'year',
        'leave_type_id',
        'total_quota',
        'used',
        'remaining',
    ];

    protected function casts(): array
    {
        return [
            'year' => 'integer',
            'total_quota' => 'integer',
            'used' => 'integer',
            'remaining' => 'integer',
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
}