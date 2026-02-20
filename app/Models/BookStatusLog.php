<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookStatusLog extends Model
{
    protected $fillable = [
        'book_id',
        'from_status',
        'to_status',
        'changed_by',
        'notes',
    ];

    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class);
    }

    public function changer(): BelongsTo
    {
        return $this->belongsTo(User::class , 'changed_by');
    }
}