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
        'author_id',
        'title',
        'isbn',
        'description',
        'price',
        'cover_path',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'status' => BookStatus::class,
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
