<?php

namespace App\Models;

use App\Traits\Auditable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Debt extends Model
{
    use HasFactory, Auditable;

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if ($model->type === 'receivable' && ! $model->kodeinvoice) {
                // Find the last invoice number from current records (Prefix INV)
                $lastAdminInvoice = static::where('type', 'receivable')
                    ->where('kodeinvoice', 'like', 'INV-%')
                    ->orderBy('id', 'desc')
                    ->first();

                $number = 1000; // Default start
                if ($lastAdminInvoice && preg_match('/^INV-(\d+)-/', $lastAdminInvoice->kodeinvoice, $matches)) {
                    $number = (int) $matches[1] + 1;
                } else {
                    // Fallback to legacy structure if INV- is not present
                    $lastInvoice = static::where('type', 'receivable')
                        ->whereNotNull('kodeinvoice')
                        ->orderBy('id', 'desc')
                        ->first();
                    if ($lastInvoice && preg_match('/^(\d+)-/', $lastInvoice->kodeinvoice, $matches)) {
                        $number = (int) $matches[1] + 1;
                    }
                }

                $rand = strtolower(Str::random(3));
                $month = date('m');
                $year = date('Y');

                // Set new invoice code
                $model->kodeinvoice = sprintf('INV-%d-%s-%s-%s', $number, $rand, $month, $year);
            }
        });

        static::created(function ($model) {
            // Record Journal for Sales (Accrual)
            // Debit: Piutang Usaha (1103), Credit: Pendapatan Penjualan (4101)
            if ($model->type === 'receivable') {
                $piutangAccount = \App\Models\Accounting\Account::where('code', '1103')->first();
                $incomeAccount = \App\Models\Accounting\Account::where('code', '4101')->first();

                if ($piutangAccount && $incomeAccount) {
                    $accounting = app(\App\Domain\Finance\Services\AccountingService::class);
                    $accounting->recordJournal([
                        'date' => $model->date ?? now(),
                        'description' => 'Penjualan - '.$model->client_name,
                        'reference' => $model->kodeinvoice ?? '#'.$model->id,
                        'items' => [
                            [
                                'account_id' => $piutangAccount->id,
                                'type' => 'debit',
                                'amount' => $model->amount,
                            ],
                            [
                                'account_id' => $incomeAccount->id,
                                'type' => 'credit',
                                'amount' => $model->amount,
                            ],
                        ],
                    ], auth()->id() ?? 1);
                }
            }
        });
    }

    protected $fillable = [
        'type',
        'status',
        'date',
        'due_date',
        'contact_id',
        'client_name',
        'client_phone',
        'description',
        'amount',
        'paid_amount',
        'bank_id',
        'kodeinvoice',
        'items',
    ];

    protected $casts = [
        'date' => 'date',
        'due_date' => 'date',
        'amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'items' => 'array',
    ];

    public function payments(): HasMany
    {
        return $this->hasMany(DebtPayment::class);
    }

    public function bank(): BelongsTo
    {
        return $this->belongsTo(Bank::class);
    }

    public function updateStatus(): void
    {
        $this->paid_amount = $this->payments()->sum('amount');

        if ($this->paid_amount <= 0) {
            $this->status = 'unpaid';
        } elseif ($this->paid_amount >= $this->amount) {
            $this->status = 'paid';
        } else {
            $this->status = 'partial';
        }

        $this->save();
    }
}
