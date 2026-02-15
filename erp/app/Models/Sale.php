<?php

namespace App\Models;

use App\Enums\ContractStatus;
use App\Enums\SaleStatus;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Validation\ValidationException;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Sale extends Model
{
    /** @use HasFactory<\Database\Factories\SaleFactory> */
    use HasFactory;
    use LogsActivity;

    protected $fillable = [
        'sales_import_id',
        'marketplace_id',
        'book_id',
        'transaction_id',
        'period_month',
        'quantity',
        'net_price',
        'status',
        'imported_by',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'net_price' => 'decimal:2',
            'status' => SaleStatus::class,
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (self $sale): void {
            if ($sale->imported_by === null && auth()->check()) {
                $sale->imported_by = auth()->id();
            }
        });

        static::saving(function (self $sale): void {
            if (! preg_match('/^\\d{4}-(0[1-9]|1[0-2])$/', $sale->period_month)) {
                throw ValidationException::withMessages([
                    'period_month' => 'Format period_month wajib YYYY-MM.',
                ]);
            }

            $periodStart = Carbon::createFromFormat('Y-m', $sale->period_month)->startOfMonth();
            $periodEnd = Carbon::createFromFormat('Y-m', $sale->period_month)->endOfMonth();

            $approvedContractExists = Contract::query()
                ->where('book_id', $sale->book_id)
                ->where('status', ContractStatus::Approved)
                ->whereDate('start_date', '<=', $periodEnd)
                ->whereDate('end_date', '>=', $periodStart)
                ->exists();

            if (! $approvedContractExists) {
                throw ValidationException::withMessages([
                    'book_id' => 'Sales hanya boleh dicatat untuk buku dengan kontrak approved aktif.',
                ]);
            }
        });
    }

    public function salesImport(): BelongsTo
    {
        return $this->belongsTo(SalesImport::class);
    }

    public function marketplace(): BelongsTo
    {
        return $this->belongsTo(Marketplace::class);
    }

    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class);
    }

    public function importer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'imported_by');
    }

    public function royaltyItems(): HasMany
    {
        return $this->hasMany(RoyaltyItem::class);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty();
    }
}
