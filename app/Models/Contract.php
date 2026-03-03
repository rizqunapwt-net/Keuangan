<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Contract extends Model
{
    protected $fillable = [
        'book_id',
        'status',
        'royalty_percentage',
        'start_date',
        'end_date',
        'contract_file_path',
        'description',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'royalty_percentage' => 'decimal:2',
            'start_date' => 'date',
            'end_date' => 'date',
        ];
    }

    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class);
    }
}

