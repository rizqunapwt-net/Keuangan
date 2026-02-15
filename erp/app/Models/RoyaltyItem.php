<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RoyaltyItem extends Model
{
    /** @use HasFactory<\Database\Factories\RoyaltyItemFactory> */
    use HasFactory;

    protected $fillable = [
        'royalty_calculation_id',
        'sale_id',
        'book_id',
        'quantity',
        'net_price',
        'royalty_percentage',
        'amount',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'net_price' => 'decimal:2',
            'royalty_percentage' => 'decimal:2',
            'amount' => 'decimal:2',
        ];
    }

    public function calculation(): BelongsTo
    {
        return $this->belongsTo(RoyaltyCalculation::class, 'royalty_calculation_id');
    }

    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class);
    }

    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class);
    }
}
