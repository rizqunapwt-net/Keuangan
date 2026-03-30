<?php

namespace App\Models;

use App\Enums\BankStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Bank extends Model
{
    /** @use HasFactory<\Database\Factories\BankFactory> */
    use HasFactory;

    use LogsActivity;
    use SoftDeletes;

    protected $table = 'banks';

    protected $fillable = [
        'bank_code',
        'bank_name',
        'branch_name',
        'account_number',
        'account_holder',
        'account_type',
        'currency',
        'balance',
        'opening_balance',
        'opening_date',
        'account_id',
        'manager_id',
        'status',
        'is_primary',
        'notes',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'balance' => 'decimal:2',
            'opening_balance' => 'decimal:2',
            'opening_date' => 'date',
            'status' => BankStatus::class,
            'is_primary' => 'boolean',
            'metadata' => 'json',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (self $bank): void {
            if ($bank->manager_id === null && auth()->check()) {
                $bank->manager_id = auth()->id();
            }
            if (empty($bank->uuid)) {
                $bank->uuid = (string) \Illuminate\Support\Str::uuid();
            }
            if (empty($bank->bank_code)) {
                $bank->bank_code = substr($bank->bank_name, 0, 3).'-'.date('YmdHis');
            }
            if ($bank->status === null) {
                $bank->status = BankStatus::ACTIVE;
            }
            if ($bank->balance === null) {
                $bank->balance = $bank->opening_balance ?? 0;
            }
        });
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['account_number', 'balance', 'status', 'is_primary'])
            ->useLogName('bank')
            ->logOnlyDirty();
    }

    /* ======== Relations ======== */

    public function account(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Accounting\Account::class);
    }

    public function manager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    public function cashTransactions(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(CashTransaction::class);
    }

    /* ======== Scopes ======== */

    public function scopeActive($query)
    {
        return $query->where('status', BankStatus::ACTIVE);
    }

    public function scopeInactive($query)
    {
        return $query->where('status', BankStatus::INACTIVE);
    }

    public function scopePrimary($query)
    {
        return $query->where('is_primary', true);
    }

    public function scopeByBank($query, string $bankName)
    {
        return $query->where('bank_name', 'like', "%{$bankName}%");
    }

    /* ======== Methods ======== */

    public function updateBalance(float $amount): void
    {
        $this->increment('balance', $amount);
    }

    public function deductBalance(float $amount): void
    {
        $this->decrement('balance', $amount);
    }

    public function deactivate(): void
    {
        $this->update(['status' => BankStatus::INACTIVE]);
    }

    public function activate(): void
    {
        $this->update(['status' => BankStatus::ACTIVE]);
    }

    public function isActive(): bool
    {
        return $this->status === BankStatus::ACTIVE;
    }

    public function isPrimary(): bool
    {
        return $this->is_primary === true;
    }
}
