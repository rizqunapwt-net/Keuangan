<?php

namespace App\Models\Percetakan;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'type',
        'email',
        'phone',
        'company_name',
        'npwp',
        'address',
        'city',
        'province',
        'postal_code',
        'credit_limit',
        'payment_terms_days',
        'discount_percentage',
        'status',
        'notes',
        'user_id',
    ];

    protected function casts(): array
    {
        return [
            'credit_limit' => 'decimal:2',
            'discount_percentage' => 'decimal:2',
            'payment_terms_days' => 'integer',
        ];
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    public function isCorporate(): bool
    {
        return $this->type === 'corporate';
    }

    public function getFullNameAttribute(): string
    {
        return $this->company_name ?? $this->name;
    }
}
