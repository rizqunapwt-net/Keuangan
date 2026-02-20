<?php

namespace App\Models\Percetakan;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderSpecification extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'size',
        'paper_type',
        'paper_weight',
        'colors_inside',
        'colors_outside',
        'binding_type',
        'finishing',
        'pages_count',
        'print_run',
        'waste_allowance',
        'custom_fields',
    ];

    protected function casts(): array
    {
        return [
            'pages_count' => 'integer',
            'print_run' => 'integer',
            'waste_allowance' => 'decimal:2',
            'custom_fields' => 'array',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function getFullPaperSpecAttribute(): string
    {
        return "{$this->paper_type} {$this->paper_weight}";
    }

    public function getColorsDescriptionAttribute(): string
    {
        $inside = $this->colors_inside ?? 'N/A';
        $outside = $this->colors_outside ?? 'N/A';
        
        return "Outside: {$outside}, Inside: {$inside}";
    }
}
