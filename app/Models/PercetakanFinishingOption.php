<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PercetakanFinishingOption extends Model
{
    use HasFactory;

    protected $table = 'percetakan_finishing_options';

    protected $fillable = [
        'name',
        'category',
        'price_type',
        'price',
        'is_active',
        'specifications',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_active' => 'boolean',
        'specifications' => 'array',
    ];

    /**
     * Calculate finishing price based on type and quantity
     */
    public function calculatePrice(float $area = 1, float $quantity = 1, float $perimeter = 0): float
    {
        $basePrice = (float) $this->price;
        
        return match($this->price_type) {
            'per_m2' => $basePrice * $area,
            'per_pcs' => $basePrice * $quantity,
            'per_meter' => $basePrice * $perimeter,
            'fixed' => $basePrice,
            default => $basePrice,
        };
    }

    /**
     * Scope for active options only
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope by category
     */
    public function scopeCategory($query, ?string $category)
    {
        return $category ? $query->where('category', $category) : $query;
    }
}
