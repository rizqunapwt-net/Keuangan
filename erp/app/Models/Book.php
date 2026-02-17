<?php

namespace App\Models;

use App\Enums\BookStatus;
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
        'tracking_code',
        'author_id',
        'title',
        'isbn',
        'description',
        'price',
        'stock',
        'cover_path',
        'status',
    ];

    protected static function booted(): void
    {
        static::creating(function (self$book) {
            if (empty($book->tracking_code)) {
                $book->tracking_code = 'NRE-' . strtoupper(\Illuminate\Support\Str::random(8));
            }
        });
    }

    public function getProgressPercentage(): int
    {
        return match ($this->status) {
                BookStatus::DRAFT => 5,
                BookStatus::INCOMING => 15,
                BookStatus::EDITORIAL => 30,
                BookStatus::LAYOUTING => 50,
                BookStatus::IS_ISBN_PROCESS => 70,
                BookStatus::PRODUCTION => 85,
                BookStatus::WAREHOUSE, BookStatus::PUBLISHED => 100,
                default => 0,
            };
    }

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'stock' => 'integer',
            'status' => BookStatus::class ,
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

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty();
    }
}