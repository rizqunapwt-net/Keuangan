<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Supplier extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'company_name',
        'npwp',
        'email',
        'phone',
        'address',
        'city',
        'province',
        'contact_person',
        'contact_phone',
        'payment_terms_days',
        'credit_limit',
        'product_specialty',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'payment_terms_days' => 'integer',
            'credit_limit' => 'decimal:2',
        ];
    }

    public function purchaseOrders(): HasMany
    {
        return $this->hasMany(PurchaseOrder::class);
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}
