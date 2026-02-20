<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Author extends Model
{
    use HasFactory;
    use LogsActivity;

    protected $fillable = [
        'user_id',
        'name',
        'email',
        'phone',
        'bio',
        'photo_path',
        'bank_name',
        'bank_account',
        'bank_account_name',
        'npwp',
        'ktp_path',
        'status',
        'royalty_percentage',
        'address',
    ];

    protected function casts(): array
    {
        return [
            'royalty_percentage' => 'decimal:2',
        ];
    }

    /**
     * Get the user that owns the author profile
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get all books by this author
     */
    public function books(): HasMany
    {
        return $this->hasMany(Book::class);
    }

    /**
     * Get all contracts for this author's books
     */
    public function contracts(): HasMany
    {
        return $this->hasManyThrough(Contract::class, Book::class, 'author_id', 'book_id');
    }

    /**
     * Get all royalty calculations for this author's books
     */
    public function royalties(): HasMany
    {
        return $this->hasManyThrough(RoyaltyCalculation::class, Book::class, 'author_id', 'book_id');
    }

    /**
     * Get all sales for this author's books
     */
    public function sales(): HasMany
    {
        return $this->hasManyThrough(Sale::class, Book::class, 'author_id', 'book_id');
    }

    /**
     * Get published books count
     */
    public function getPublishedBooksCountAttribute(): int
    {
        return $this->books()->where('status', 'published')->count();
    }

    /**
     * Get active contracts count
     */
    public function getActiveContractsCountAttribute(): int
    {
        return $this->contracts()->where('status', 'approved')->count();
    }

    /**
     * Get total royalties earned
     */
    public function getTotalRoyaltiesAttribute(): float
    {
        return $this->royalties()->sum('total_royalty');
    }

    /**
     * Get paid royalties
     */
    public function getPaidRoyaltiesAttribute(): float
    {
        return $this->royalties()
            ->whereHas('payment', fn($q) => $q->where('status', 'paid'))
            ->sum('total_royalty');
    }

    /**
     * Get pending royalties
     */
    public function getPendingRoyaltiesAttribute(): float
    {
        return $this->totalRoyalties - $this->paidRoyalties;
    }

    /**
     * Check if author is active
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Get author dashboard statistics
     */
    public function getDashboardStats(): array
    {
        $bookIds = $this->books->pluck('id');

        return [
            'total_books' => $this->books->count(),
            'published_books' => $this->published_books_count,
            'in_production_books' => $this->books()->whereIn('status', ['production', 'in_production'])->count(),
            'active_contracts' => $this->active_contracts_count,
            'pending_contracts' => $this->contracts()->where('status', 'pending')->count(),
            'total_royalties' => $this->total_royalties,
            'paid_royalties' => $this->paid_royalties,
            'pending_royalties' => $this->pending_royalties,
            'monthly_sales' => $this->sales()
                ->where('period_month', now()->format('Y-m'))
                ->sum('quantity'),
            'monthly_revenue' => $this->sales()
                ->where('period_month', now()->format('Y-m'))
                ->sum(DB::raw('quantity * net_price')),
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "Author profile {$eventName}");
    }
}
