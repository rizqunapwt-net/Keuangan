<?php

namespace App\Models;

use App\Enums\SalesImportStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class SalesImport extends Model
{
    /** @use HasFactory<\Database\Factories\SalesImportFactory> */
    use HasFactory;
    use LogsActivity;

    protected $fillable = [
        'period_month',
        'marketplace_code',
        'file_name',
        'total_rows',
        'imported_rows',
        'failed_rows',
        'status',
        'error_report_path',
        'imported_by',
    ];

    protected function casts(): array
    {
        return [
            'status' => SalesImportStatus::class,
        ];
    }

    public function importer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'imported_by');
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
