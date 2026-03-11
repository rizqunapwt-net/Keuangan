<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Debt extends Model
{
    use HasFactory;

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if ($model->type === 'receivable' && ! $model->kodeinvoice) {
                // Get last invoice number from the prefix
                $lastInvoice = static::where('type', 'receivable')
                    ->whereNotNull('kodeinvoice')
                    ->orderBy('id', 'desc')
                    ->first();

                $number = 1000; // Default starting number if no invoices exist
                if ($lastInvoice && preg_match('/^(\d+)-/', $lastInvoice->kodeinvoice, $matches)) {
                    $number = (int) $matches[1] + 1;
                }

                // If number is somehow less than ID (e.g. migration gap), use ID
                // But for now, let's stick to the pattern: {NUMBER}-{RAND3}-{MM}-{YYYY}
                $rand = strtolower(Str::random(3));
                $month = date('m');
                $year = date('Y');

                $model->kodeinvoice = sprintf('%d-%s-%s-%s', $number, $rand, $month, $year);
            }
        });
    }

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
