<?php

namespace App\Models\Percetakan;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductionJob extends Model
{
    use HasFactory;

    protected $fillable = [
        'job_number',
        'order_id',
        'stage',
        'status',
        'machine_id',
        'operator_id',
        'supervisor_id',
        'started_at',
        'completed_at',
        'quantity_good',
        'quantity_waste',
        'instructions',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
            'quantity_good' => 'integer',
            'quantity_waste' => 'integer',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function machine(): BelongsTo
    {
        return $this->belongsTo(Machine::class);
    }

    public function operator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'operator_id');
    }

    public function supervisor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'supervisor_id');
    }

    public function jobCards(): HasMany
    {
        return $this->hasMany(JobCard::class);
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isInProgress(): bool
    {
        return $this->status === 'in_progress';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function getEfficiencyAttribute(): ?float
    {
        if (!$this->quantity_good || !$this->quantity_waste) {
            return null;
        }

        $total = $this->quantity_good + $this->quantity_waste;
        return ($this->quantity_good / $total) * 100;
    }
}
