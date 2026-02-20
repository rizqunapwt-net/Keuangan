<?php

namespace App\Models;

use App\Enums\BookStatus;
use App\Enums\PrintingBookStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Book extends Model
{
    /** @use HasFactory<\Database\Factories\BookFactory> */
    use HasFactory;
    use LogsActivity;

    protected $fillable = [
        'type', // 'publishing' or 'printing'
        'tracking_code',
        'author_id',
        'title',
        'isbn',
        'description',
        'price',
        'stock',
        'cover_path',
        'cover_file_path',
        'status',
        'gdrive_link',
        'surat_scan_path',
        'surat_status',
        'revision_notes',
        'page_count',
        'size',
        'published_year',
    ];

    protected static function booted(): void
    {
        static::creating(function (self$book) {
            if (empty($book->tracking_code)) {
                $book->tracking_code = 'NRE-' . strtoupper(\Illuminate\Support\Str::random(8));
            }
        });
    }

    public function isPrinting(): bool
    {
        return $this->type === 'printing';
    }

    public function isPublishing(): bool
    {
        return $this->type === 'publishing';
    }

    public function scopePublishing(Builder $query): Builder
    {
        return $query->where('type', 'publishing');
    }

    public function scopePrinting(Builder $query): Builder
    {
        return $query->where('type', 'printing');
    }

    public function getProgressPercentage(): int
    {
        if ($this->isPrinting()) {
            return $this->getPrintingProgress();
        }

        return match ($this->status) {
                BookStatus::DRAFT => 0,
                BookStatus::INCOMING => 10,
                BookStatus::REVIEW => 20,
                BookStatus::EDITORIAL => 35,
                BookStatus::COVERING => 50,
                BookStatus::APPROVING => 60,
                BookStatus::SURAT_PERNYATAAN => 70,
                BookStatus::IS_ISBN_PROCESS => 80,
                BookStatus::PRODUCTION => 90,
                BookStatus::WAREHOUSE, BookStatus::PUBLISHED => 100,
                BookStatus::REVISION => 15,
                default => 0,
            };
    }

    private function getPrintingProgress(): int
    {
        $statusValue = $this->status instanceof PrintingBookStatus
            ? $this->status->value
            : ($this->status instanceof BookStatus ? $this->status->value : $this->status);

        return match ($statusValue) {
                'draft' => 0,
                'incoming' => 15,
                'review' => 30,
                'editorial' => 50,
                'covering' => 65,
                'production' => 85,
                'done' => 100,
                'revision' => 15,
                default => 0,
            };
    }

    /**
     * Get allowed status transitions based on book type.
     */
    public function getAllowedTransitions(): array
    {
        $statusValue = $this->status instanceof \BackedEnum
            ? $this->status->value
            : $this->status;

        if ($this->isPrinting()) {
            $printStatus = PrintingBookStatus::tryFrom($statusValue);
            if ($printStatus) {
                return array_map(fn($s) => ['value' => $s->value, 'label' => $s->getLabel()], $printStatus->allowedTransitions());
            }
            return [];
        }

        if ($this->status instanceof BookStatus) {
            return array_map(fn($s) => ['value' => $s->value, 'label' => $s->getLabel()], $this->status->allowedTransitions());
        }

        $bookStatus = BookStatus::tryFrom($statusValue);
        if ($bookStatus) {
            return array_map(fn($s) => ['value' => $s->value, 'label' => $s->getLabel()], $bookStatus->allowedTransitions());
        }

        return [];
    }

    protected function casts(): array
    {
        $statusEnum = ($this->type === 'printing') ?PrintingBookStatus::class : BookStatus::class;

        return [
            'price' => 'decimal:2',
            'stock' => 'integer',
            'status' => $statusEnum,
        ];
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(Author::class);
    }

    public function contracts(): HasMany
    {
        return $this->hasMany(Contract::class);
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(Assignment::class);
    }

    public function sales(): HasMany
    {
        return $this->hasMany(Sale::class);
    }

    public function printOrders(): HasMany
    {
        return $this->hasMany(PrintOrder::class);
    }

    public function files(): HasMany
    {
        return $this->hasMany(BookFile::class);
    }

    public function statusLogs(): HasMany
    {
        return $this->hasMany(BookStatusLog::class);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty();
    }
}