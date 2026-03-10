<?php

namespace App\Models\Percetakan;

use Illuminate\Database\Eloquent\Model;

class FinishingOption extends Model
{
    protected $table = 'percetakan_finishing_options';

    protected $fillable = [
        'code',
        'name',
        'category',
        'pricing_type',
        'price',
        'description',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];
}
