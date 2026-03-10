<?php

namespace App\Models\Percetakan;

use Illuminate\Database\Eloquent\Model;

class PriceTier extends Model
{
    protected $table = 'percetakan_price_tiers';

    protected $fillable = [
        'product_id', 'size', 'paper_type',
        'min_qty', 'max_qty', 'price_per_unit',
        'discount_percent', 'print_method',
    ];

    protected $casts = [
        'price_per_unit'   => 'decimal:2',
        'discount_percent' => 'decimal:2',
    ];

    public function product()
    {
        return $this->belongsTo(PercetakanProduct::class, 'product_id');
    }
}
