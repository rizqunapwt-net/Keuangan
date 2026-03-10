<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PercetakanProduct extends Model
{
    use HasFactory;

    protected $table = 'percetakan_products';

    protected $fillable = [
        'name',
        'category',
        'calc_type',
        'base_price',
        'min_order',
        'unit',
        'is_active',
        'specifications',
    ];

    protected $casts = [
        'base_price' => 'decimal:2',
        'min_order' => 'decimal:2',
        'is_active' => 'boolean',
        'specifications' => 'array',
    ];

    /**
     * Get price tiers for this product
     */
    public function priceTiers(): HasMany
    {
        return $this->hasMany(PercetakanPriceTier::class);
    }

    /**
     * Calculate price based on quantity/area
     */
    public function calculatePrice(float $quantity): float
    {
        // Apply min order
        $billableQuantity = max($quantity, $this->min_order);
        
        // Find applicable tier price
        $tier = $this->priceTiers()
            ->where('min_quantity', '<=', $billableQuantity)
            ->orderBy('min_quantity', 'desc')
            ->first();
        
        $unitPrice = $tier?->price ?? $this->base_price;
        
        return $unitPrice * $billableQuantity;
    }

    /**
     * Scope for active products only
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope by category
     */
    public function scopeCategory($query, string $category)
    {
        return $query->where('category', $category);
    }
}
