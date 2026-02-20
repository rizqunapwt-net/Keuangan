<?php

namespace App\Models;

use App\Enums\ContractStatus;
use App\Enums\PostingStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Validation\ValidationException;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Assignment extends Model
{
    /** @use HasFactory<\Database\Factories\AssignmentFactory> */
    use HasFactory;
    use LogsActivity;

    protected $fillable = [
        'book_id',
        'marketplace_id',
        'product_url',
        'posting_status',
        'assigned_by',
    ];

    protected function casts(): array
    {
        return [
            'posting_status' => PostingStatus::class,
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (self $assignment): void {
            if ($assignment->assigned_by === null && auth()->check()) {
                $assignment->assigned_by = auth()->id();
            }
        });

        static::saving(function (self $assignment): void {
            $book = $assignment->book()->with('contracts')->first();

            if (! $book) {
                return;
            }

            $hasApprovedContract = $book->contracts()
                ->where('status', ContractStatus::Approved)
                ->whereDate('start_date', '<=', now()->toDateString())
                ->whereDate('end_date', '>=', now()->toDateString())
                ->exists();

            if (! $hasApprovedContract) {
                throw ValidationException::withMessages([
                    'book_id' => 'Buku hanya dapat di-assign jika kontraknya berstatus approved dan masih aktif.',
                ]);
            }
        });
    }

    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class);
    }

    public function marketplace(): BelongsTo
    {
        return $this->belongsTo(Marketplace::class);
    }

    public function assigner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty();
    }
}
