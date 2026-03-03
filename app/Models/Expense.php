<?php

namespace App\Models;

use App\Models\Accounting\Account;
use App\Models\Accounting\JournalEntry;
use App\Enums\ExpenseStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Expense extends Model
{
    /** @use HasFactory<\Database\Factories\ExpenseFactory> */
    use HasFactory;

    use LogsActivity;
    use SoftDeletes;

    protected $table = 'expenses';

    protected $fillable = [
        'expense_code',
        'account_id',
        'user_id',
        'journal_entry_id',
        'description',
        'category',
        'amount',
        'currency',
        'expense_date',
        'payment_method',
        'reference_number',
        'notes',
        'status',
        'approved_by',
        'approved_at',
        'voided_by',
        'voided_at',
        'void_reason',
        'attachment_path',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'expense_date' => 'date',
            'approved_at' => 'datetime',
            'voided_at' => 'datetime',
            'status' => ExpenseStatus::class,
            'metadata' => 'json',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (self $expense): void {
            if ($expense->user_id === null && auth()->check()) {
                $expense->user_id = auth()->id();
            }
            if (empty($expense->uuid)) {
                $expense->uuid = (string) \Illuminate\Support\Str::uuid();
            }
            if (empty($expense->expense_code)) {
                $expense->expense_code = 'EXP-'.date('YmdHis').'-'.rand(1000, 9999);
            }
            if ($expense->status === null) {
                $expense->status = ExpenseStatus::PENDING;
            }
        });
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['amount', 'description', 'status', 'approved_at', 'voided_at'])
            ->useLogName('expense')
            ->logOnlyDirty();
    }

    /* ======== Relations ======== */

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function journalEntry(): BelongsTo
    {
        return $this->belongsTo(JournalEntry::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function voidedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'voided_by');
    }

    /* ======== Scopes ======== */

    public function scopePending($query)
    {
        return $query->where('status', ExpenseStatus::PENDING);
    }

    public function scopeApproved($query)
    {
        return $query->where('status', ExpenseStatus::APPROVED);
    }

    public function scopeVoided($query)
    {
        return $query->whereNotNull('voided_at');
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('expense_date', [$startDate, $endDate]);
    }

    /* ======== Methods ======== */

    public function approve(int $userId): void
    {
        $this->update([
            'status' => ExpenseStatus::APPROVED,
            'approved_by' => $userId,
            'approved_at' => now(),
        ]);
    }

    public function void(int $userId, string $reason): void
    {
        $this->update([
            'status' => ExpenseStatus::VOIDED,
            'voided_by' => $userId,
            'voided_at' => now(),
            'void_reason' => $reason,
        ]);
    }

    public function isVoided(): bool
    {
        return $this->voided_at !== null;
    }

    public function isPending(): bool
    {
        return $this->status === ExpenseStatus::PENDING;
    }

    public function isApproved(): bool
    {
        return $this->status === ExpenseStatus::APPROVED;
    }
}
