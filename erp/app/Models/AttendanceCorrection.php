<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AttendanceCorrection extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = [
        'attendance_id',
        'corrected_by_user_id',
        'field_name',
        'before_value',
        'after_value',
        'reason',
    ];

    public function attendance(): BelongsTo
    {
        return $this->belongsTo(Attendance::class);
    }

    public function correctedBy(): BelongsTo
    {
        return $this->belongsTo(User::class , 'corrected_by_user_id');
    }
}