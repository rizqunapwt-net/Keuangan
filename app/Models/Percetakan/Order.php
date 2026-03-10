<?php

namespace App\Models\Percetakan;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use SoftDeletes;

    protected $table = 'percetakan_orders';

    protected $fillable = [
        'order_number',
        'customer_id',
        'sales_id',
        'status',
        'product_id',
        'percetakan_product_id', // New link to master product
        'specifications',
        'finishing_details',     // New JSON details
        'quantity',
        'unit_price',
        'subtotal',
        'discount_amount',
        'tax_amount',
        'total_amount',
        'deposit_percentage',
        'deposit_amount',
        'deposit_paid',
        'balance_due',
        'order_date',
        'deadline',
        'priority',
        'is_rush_order',
        'production_notes',
        'customer_notes',
        'width_cm',              // Technical dimensions
        'height_cm',
        'area_m2',
        'print_method',
        'paper_type',
        'paper_size',
        'color_mode',
        'print_sides',
        'page_count',
        'binding_type',
        'weight_kg',
        'sticker_unit_w',
        'sticker_unit_h',
        'sticker_per_sheet',
        'sheet_count',
        'cutting_method',
        'design_link'            // Design cloud link
    ];

    protected $casts = [
        'specifications' => 'json',
        'finishing_details' => 'json',
        'order_date' => 'date',
        'deadline' => 'date',
        'is_rush_order' => 'boolean',
        'quantity' => 'decimal:2', // qty can be m2 decimal
        'unit_price' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'balance_due' => 'decimal:2',
        'width_cm' => 'decimal:2',
        'height_cm' => 'decimal:2',
        'area_m2' => 'decimal:4',
        'weight_kg' => 'decimal:3',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'customer_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(PercetakanProduct::class, 'percetakan_product_id');
    }

    public function sales(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'sales_id');
    }
}
