<?php

namespace App\Models\Accounting;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;

class Period extends Model
{
    use HasFactory;

    protected $table = 'accounting_periods';

    protected $fillable = [
        'period_month',
        'status',
        'closed_at',
        'closed_by',
        'notes',
    ];

    protected $casts = [
        'closed_at' => 'datetime',
    ];

    public function closer(): BelongsTo
    {
        return $this->belongsTo(User::class , 'closed_by');
    }

    /**
     * Check if a specific date or period is closed.
     */
    public static function isClosed(string $periodMonth): bool
    {
        return static::where('period_month', $periodMonth)
            ->where('status', 'closed')
            ->exists();
    }
}