<?php

namespace App\Models\Percetakan;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    use SoftDeletes;

    protected $table = 'percetakan_customers';

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
        'notes',
        'user_id',
        'status',
    ];

    protected $casts = [
        'credit_limit' => 'decimal:2',
        'discount_percentage' => 'decimal:2',
        'payment_terms_days' => 'integer',
    ];

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'customer_id');
    }
}
