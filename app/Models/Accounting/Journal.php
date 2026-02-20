<?php

namespace App\Models\Accounting;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;

class Journal extends Model
{
    use HasFactory;

    protected $table = 'accounting_journals';

    protected $fillable = [
        'journal_number', // JRN-202602-0001
        'date',
        'reference', // invoice_number, receipt_number
        'description',
        'total_amount',
        'status', // draft, posted
        'created_by',
    ];

    protected $casts = [
        'date' => 'date',
        'total_amount' => 'decimal:2',
    ];

    public function entries(): HasMany
    {
        return $this->hasMany(JournalEntry::class , 'journal_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class , 'created_by');
    }

    // Helper to generate journal number
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (!$model->created_by) {
                $model->created_by = auth()->id();
            }
            if (!$model->journal_number) {
                $prefix = 'JRN-' . now()->format('Ym');
                $last = static::where('journal_number', 'like', "$prefix%")->count();
                $model->journal_number = $prefix . '-' . str_pad($last + 1, 4, '0', STR_PAD_LEFT);
            }
        });
    }
}