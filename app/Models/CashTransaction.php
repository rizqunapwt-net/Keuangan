<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CashTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'bank_id',
        'date',
        'time',
        'amount',
        'category',
        'description',
        'running_balance',
    ];

    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2',
        'running_balance' => 'decimal:2',
    ];

    public function bank(): BelongsTo
    {
        return $this->belongsTo(Bank::class);
    }
}
