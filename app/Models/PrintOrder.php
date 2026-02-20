<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PrintOrder extends Model
{
    protected $fillable = [
        'book_id',
        'order_number',
        'vendor_name',
        'vendor_contact',
        'quantity',
        'unit_cost',
        'total_cost',
        'paper_type',
        'binding_type',
        'cover_type',
        'page_count',
        'size',
        'status',
        'ordered_by',
        'ordered_at',
        'expected_delivery',
        'delivered_at',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'unit_cost' => 'decimal:2',
            'total_cost' => 'decimal:2',
            'ordered_at' => 'date',
            'expected_delivery' => 'date',
            'delivered_at' => 'date',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (self$order) {
            if (empty($order->order_number)) {
                $order->order_number = 'PO-' . date('Ymd') . '-' . strtoupper(\Illuminate\Support\Str::random(4));
            }
            $order->total_cost = $order->quantity * $order->unit_cost;
        });

        static::updating(function (self$order) {
            $order->total_cost = $order->quantity * $order->unit_cost;
        });
    }

    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class);
    }

    public function orderer(): BelongsTo
    {
        return $this->belongsTo(User::class , 'ordered_by');
    }
}