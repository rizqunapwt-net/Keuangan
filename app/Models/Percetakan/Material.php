<?php

namespace App\Models\Percetakan;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Material extends Model
{
    protected $table = 'percetakan_materials';

    protected $fillable = [
        'code',
        'name',
        'category',
        'type',
        'specification',
        'unit',
        'current_stock',
        'min_stock',
        'max_stock',
        'unit_cost',
        'last_purchase_price',
        'supplier_id',
        'location',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'current_stock' => 'decimal:2',
            'min_stock' => 'decimal:2',
            'max_stock' => 'decimal:2',
            'unit_cost' => 'decimal:2',
            'last_purchase_price' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Supplier::class);
    }
}

