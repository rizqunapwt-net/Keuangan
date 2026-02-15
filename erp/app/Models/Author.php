<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Author extends Model
{
    /** @use HasFactory<\Database\Factories\AuthorFactory> */
    use HasFactory;
    use LogsActivity;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'address',
        'bank_name',
        'bank_account',
        'npwp',
        'ktp_path',
        'status',
    ];

    public function books(): HasMany
    {
        return $this->hasMany(Book::class);
    }

    public function royaltyCalculations(): HasMany
    {
        return $this->hasMany(RoyaltyCalculation::class);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty();
    }
}
