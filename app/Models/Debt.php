<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Debt extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'status',
        'date',
        'due_date',
        'client_name',
        'client_phone',
        'description',
        'amount',
        'paid_amount',
        'bank_id',
        'kodeinvoice',
        'items',
    ];

    protected $casts = [
        'date' => 'date',
        'due_date' => 'date',
        'amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'items' => 'array',
    ];

    public function payments(): HasMany
    {
        return $this->hasMany(DebtPayment::class);
    }

    public function bank(): BelongsTo
    {
        return $this->belongsTo(Bank::class);
    }

    public function updateStatus(): void
    {
        $this->paid_amount = $this->payments()->sum('amount');
        
        if ($this->paid_amount <= 0) {
            $this->status = 'unpaid';
        } elseif ($this->paid_amount >= $this->amount) {
            $this->status = 'paid';
        } else {
            $this->status = 'partial';
        }
        
        $this->save();
    }
}
