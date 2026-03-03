<?php

namespace App\Models\Accounting;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Journal extends Model
{
    use HasFactory;

    protected $table = 'accounting_journals';

    protected $fillable = [
        'journal_number',
        'date',
        'reference',
        'description',
        'total_amount',
        'status', // draft, posted
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'total_amount' => 'decimal:2',
        ];
    }

    public function entries(): HasMany
    {
        return $this->hasMany(JournalEntry::class, 'journal_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function creator(): BelongsTo
    {
        return $this->user();
    }

    /**
     * Validasi apakah jurnal seimbang (Debit == Credit)
     */
    public function isBalanced(): bool
    {
        $debit = $this->entries()->where('type', 'debit')->sum('amount');
        $credit = $this->entries()->where('type', 'credit')->sum('amount');

        return abs($debit - $credit) < 0.001;
    }

    protected static function booted(): void
    {
        static::creating(function ($model) {
            if (! $model->created_by) {
                $model->created_by = auth()->id();
            }
            if (! $model->journal_number) {
                $prefix = 'JRN-'.now()->format('Ym');
                $last = static::where('journal_number', 'like', "$prefix%")->count();
                $model->journal_number = $prefix.'-'.str_pad($last + 1, 4, '0', STR_PAD_LEFT);
            }
        });

        // Pastikan total_amount selalu sinkron dengan total debit
        static::saved(function ($model) {
            $totalDebit = $model->entries()->where('type', 'debit')->sum('amount');
            if ($model->total_amount != $totalDebit) {
                $model->updateQuietly(['total_amount' => $totalDebit]);
            }
        });
    }
}
