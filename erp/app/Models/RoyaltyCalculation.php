<?php

namespace App\Models;

use App\Enums\RoyaltyStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class RoyaltyCalculation extends Model
{
    /** @use HasFactory<\Database\Factories\RoyaltyCalculationFactory> */
    use HasFactory;
    use LogsActivity;

    protected $fillable = [
        'period_month',
        'author_id',
        'total_amount',
        'status',
        'calculated_by',
        'calculated_at',
        'finalized_by',
        'finalized_at',
    ];

    protected function casts(): array
    {
        return [
            'total_amount' => 'decimal:2',
            'calculated_at' => 'datetime',
            'finalized_at' => 'datetime',
            'status' => RoyaltyStatus::class,
        ];
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(Author::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(RoyaltyItem::class);
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    public function calculator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'calculated_by');
    }

    public function finalizer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'finalized_by');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty();
    }
}
