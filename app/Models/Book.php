<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Book extends Model
{
    protected $fillable = [
        'type',
        'author_id',
        'title',
        'slug',
        'isbn',
        'price',
        'stock',
        'status',
        'is_published',
        'is_digital',
        'published_at',
        'page_count',
        'size',
        'published_year',
        'publisher',
        'publisher_city',
        'description',
        'tracking_code',
        'cover_path',
        'pdf_full_path',
        'pdf_preview_path',
        'category_id',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'is_published' => 'boolean',
            'is_digital' => 'boolean',
            'published_at' => 'datetime',
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
}
