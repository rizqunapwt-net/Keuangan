<?php

namespace App\Models\Accounting;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JournalEntry extends Model
{
    use HasFactory;

    protected $table = 'accounting_journal_entries';

    // No timestamps needed for details if main journal has them
    public $timestamps = false;

    protected $fillable = [
        'journal_id',
        'account_id',
        'type', // debit, credit
        'amount',
        'memo', // line item description
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    public function journal(): BelongsTo
    {
        return $this->belongsTo(Journal::class , 'journal_id');
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class , 'account_id');
    }
}