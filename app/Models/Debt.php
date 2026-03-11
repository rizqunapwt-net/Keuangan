<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Debt extends Model
{
    use HasFactory;

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if ($model->type === 'receivable' && ! $model->kodeinvoice) {
                // Cari angka terakhir dari invoice yang dibikin khusus di Admin Panel (Prefix INV)
                $lastAdminInvoice = static::where('type', 'receivable')
                    ->where('kodeinvoice', 'like', 'INV-%')
                    ->orderBy('id', 'desc')
                    ->first();

                $number = 1000; // Mulai dari 1000 jika belum ada sama sekali
                if ($lastAdminInvoice && preg_match('/^INV-(\d+)-/', $lastAdminInvoice->kodeinvoice, $matches)) {
                    $number = (int) $matches[1] + 1;
                } else {
                    // Jika belum ada INV-, lanjutkan nomor dari invoice lama (App 8089)
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

                // Tambahkan kode INV- untuk membedakan invoice bikinan web 8000 (Admin) dan 8089 (Karyawan)
                $model->kodeinvoice = sprintf('INV-%d-%s-%s-%s', $number, $rand, $month, $year);
            }
        });
    }

    protected $fillable = [
        'type',
        'status',
        'date',
        'due_date',
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
