<?php

namespace App\Models\Percetakan;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'customer_id',
        'sales_id',
        'status',
        'product_id',
        'specifications',
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
        'completed_at',
        'delivered_at',
        'production_notes',
        'customer_notes',
        'priority',
        'is_rush_order',
        'approved_by',
        'approved_at',
    ];

    protected function casts(): array
    {
        return [
            'specifications' => 'array',
            'quantity' => 'integer',
            'unit_price' => 'decimal:2',
            'subtotal' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'tax_amount' => 'decimal:2',
            'total_amount' => 'decimal:2',
            'deposit_percentage' => 'decimal:2',
            'deposit_amount' => 'decimal:2',
            'deposit_paid' => 'decimal:2',
            'balance_due' => 'decimal:2',
            'order_date' => 'date',
            'deadline' => 'date',
            'completed_at' => 'datetime',
            'delivered_at' => 'datetime',
            'is_rush_order' => 'boolean',
            'approved_at' => 'datetime',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function sales(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sales_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function specification(): HasOne
    {
        return $this->hasOne(OrderSpecification::class);
    }

    public function productionJobs(): HasMany
    {
        return $this->hasMany(ProductionJob::class);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function isInquiry(): bool
    {
        return $this->status === 'inquiry';
    }

    public function isConfirmed(): bool
    {
        return $this->status === 'confirmed';
    }

    public function isInProduction(): bool
    {
        return $this->status === 'in_production';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isDelivered(): bool
    {
        return $this->status === 'delivered';
    }

    public function getProgressPercentageAttribute(): int
    {
        $statusProgress = [
            'inquiry' => 0,
            'quoted' => 10,
            'confirmed' => 20,
            'in_production' => 50,
            'completed' => 80,
            'ready_delivery' => 90,
            'delivered' => 100,
        ];

        return $statusProgress[$this->status] ?? 0;
    }

    public function getBalancePercentageAttribute(): float
    {
        if ($this->deposit_amount <= 0) {
            return 0;
        }

        return ($this->deposit_paid / $this->deposit_amount) * 100;
    }
}
