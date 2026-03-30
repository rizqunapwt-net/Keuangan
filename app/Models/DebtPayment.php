<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DebtPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'debt_id',
        'bank_id',
        'date',
        'amount',
        'note',
    ];

    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2',
    ];

    public function debt(): BelongsTo
    {
        return $this->belongsTo(Debt::class);
    }

    public function bank(): BelongsTo
    {
        return $this->belongsTo(Bank::class);
    }

    protected static function booted()
    {
        static::created(function ($payment) {
            $payment->debt->updateStatus();

            // 1. Update Bank Balance
            if ($payment->bank_id) {
                $bank = \App\Models\Bank::find($payment->bank_id);
                if ($bank) {
                    $isIncome = $payment->debt->type === 'receivable';
                    if ($isIncome) {
                        $bank->balance += $payment->amount;
                    } else {
                        $bank->balance -= $payment->amount;
                    }
                    $bank->save();

                    // 2. Create Cash Transaction (Buku Kas)
                    \App\Models\CashTransaction::create([
                        'type' => $isIncome ? 'income' : 'expense',
                        'bank_id' => $payment->bank_id,
                        'date' => $payment->date ?? now(),
                        'amount' => $payment->amount,
                        'category' => 'Cicilan Hutang/Piutang',
                        'description' => ($isIncome ? 'Terima Pembayaran' : 'Bayar Cicilan').' - '.$payment->debt->client_name.' ('.($payment->debt->kodeinvoice ?? '#'.$payment->debt->id).')',
                        'running_balance' => $bank->balance,
                    ]);

                    // 3. Record Accounting Journal
                    // Debit: Bank Utama (1102), Credit: Piutang Usaha (1103)
                    $piutangAccount = \App\Models\Accounting\Account::where('code', '1103')->first();
                    $bankAccount = $bank->account_id ? \App\Models\Accounting\Account::find($bank->account_id) : \App\Models\Accounting\Account::where('code', '1102')->first();

                    if ($piutangAccount && $bankAccount) {
                        $accounting = app(\App\Domain\Finance\Services\AccountingService::class);
                        $accounting->recordJournal([
                            'date' => $payment->date ?? now(),
                            'description' => 'Pembayaran '.($isIncome ? 'Piutang' : 'Hutang').' - '.$payment->debt->client_name,
                            'reference' => $payment->debt->kodeinvoice ?? '#'.$payment->debt->id,
                            'items' => [
                                [
                                    'account_id' => $isIncome ? $bankAccount->id : $piutangAccount->id,
                                    'type' => 'debit',
                                    'amount' => $payment->amount,
                                ],
                                [
                                    'account_id' => $isIncome ? $piutangAccount->id : $bankAccount->id,
                                    'type' => 'credit',
                                    'amount' => $payment->amount,
                                ],
                            ],
                        ], auth()->id() ?? 1);
                    }
                }
            }
        });

        static::deleted(function ($payment) {
            $payment->debt->updateStatus();

            // Reverse balance if needed (optional, typically handled in controller for safety)
            // But for full automation, we could reverse it here.
        });
    }
}
