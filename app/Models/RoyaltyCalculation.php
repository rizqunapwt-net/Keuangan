<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RoyaltyCalculation extends Model
{
    use HasFactory;

    protected $fillable = [
        'period_month',
        'author_id',
        'total_amount',
        'status',
        'finalized_by',
        'finalized_at',
    ];

    protected function casts(): array
    {
        return [
            'total_amount' => 'decimal:2',
            'finalized_at' => 'datetime',
        ];
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(Author::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function finalizedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'finalized_by');
    }
}
