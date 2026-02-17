<?php

namespace App\Models\Accounting;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Account extends Model
{
    use HasFactory;

    protected $table = 'accounting_accounts';

    protected $fillable = [
        'code',
        'name',
        'type', // asset, liability, equity, revenue, expense
        'description',
        'is_active',
    ];

    public function entries(): HasMany
    {
        return $this->hasMany(JournalEntry::class , 'account_id');
    }
}