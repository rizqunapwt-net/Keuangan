<?php

namespace App\Models\Percetakan;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PercetakanProduct extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code', 'name', 'category', 'material_id', 'pricing_model', 'unit',
        'base_price', 'min_order_area', 'min_order_qty',
        'default_paper', 'default_gsm',
        'available_sizes', 'available_papers', 'available_sides',
        'available_laminations', 'available_folds', 'available_bindings',
        'available_finishings', 'available_colors', 'cover_paper',
        'min_pages', 'max_pages', 'digital_max_qty', 'offset_min_qty',
        'description', 'is_active', 'sort_order',
    ];

    protected $casts = [
        'base_price'             => 'decimal:2',
        'min_order_area'         => 'decimal:2',
        'available_sizes'        => 'array',
        'available_papers'       => 'array',
        'available_sides'        => 'array',
        'available_laminations'  => 'array',
        'available_folds'        => 'array',
        'available_bindings'     => 'array',
        'available_finishings'   => 'array',
        'available_colors'       => 'array',
        'is_active'              => 'boolean',
    ];

    public function priceTiers(): HasMany
    {
        return $this->hasMany(\App\Models\Percetakan\PriceTier::class, 'product_id');
    }

    public function material(): BelongsTo
    {
        return $this->belongsTo(Material::class, 'material_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOfCategory($query, string $category)
    {
        return $query->where('category', $category);
    }
}
