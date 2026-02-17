<?php

namespace App\Services;

use App\Models\Sale;
use App\Models\RoyaltyCalculation;
use App\Models\Author;
use App\Models\Book;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class AnalyticsService
{
    /**
     * Get monthly revenue trend for the last 12 months.
     */
    public function getMonthlyRevenueTrend(): array
    {
        return Cache::remember('analytics_revenue_trend', 3600, function () {
            $data = Sale::select(
                'period_month',
                DB::raw('SUM(quantity * net_price) as revenue')
            )
                ->groupBy('period_month')
                ->orderBy('period_month', 'desc')
                ->limit(12)
                ->get()
                ->reverse();

            return [
                'labels' => $data->pluck('period_month')->toArray(),
                'data' => $data->pluck('revenue')->toArray(),
            ];
        });
    }

    /**
     * Get top authors by revenue.
     */
    public function getTopAuthors(int $limit = 5): array
    {
        return Cache::remember("analytics_top_authors_{$limit}", 3600, function () use ($limit) {
            return Author::select('authors.name')
                ->join('books', 'authors.id', '=', 'books.author_id')
                ->join('sales', 'books.id', '=', 'sales.book_id')
                ->selectRaw('authors.name, SUM(sales.quantity * sales.net_price) as total_revenue')
                ->groupBy('authors.id', 'authors.name')
                ->orderBy('total_revenue', 'desc')
                ->limit($limit)
                ->get()
                ->toArray();
        });
    }

    /**
     * Get royalty statistics.
     */
    public function getRoyaltyStats(): array
    {
        return Cache::remember('analytics_royalty_stats', 3600, function () {
            return [
                'pending' => RoyaltyCalculation::where('status', 'draft')->sum('total_amount'),
                'finalized' => RoyaltyCalculation::where('status', 'finalized')->sum('total_amount'),
                'paid' => RoyaltyCalculation::where('status', 'paid')->sum('total_amount'),
            ];
        });
    }

    /**
     * Clear all analytics cache.
     */
    public function clearCache(): void
    {
        Cache::forget('analytics_revenue_trend');
        Cache::forget('analytics_top_authors_5');
        Cache::forget('analytics_royalty_stats');
    }
}