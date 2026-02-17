<?php

namespace App\Filament\Widgets\Dashboard;

use App\Enums\ContractStatus;
use App\Enums\RoyaltyStatus;
use App\Models\Author;
use App\Models\Book;
use App\Models\Contract;
use App\Models\RoyaltyCalculation;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class KpiOverview extends BaseWidget
{
    protected static ?int $sort = 4;

    protected function getStats(): array
    {
        $totalNaskah = Book::query()->count();
        $isbnMasalah = Book::query()->where('status', \App\Enums\BookStatus::IS_ISBN_PROCESS)->count();
        $antreanCetak = Book::query()->where('status', \App\Enums\BookStatus::PRODUCTION)->count();

        // Total Omset calculation
        $totalOmset = \App\Models\Sale::query()
            ->selectRaw('SUM(quantity * net_price) as total')
            ->value('total') ?? 0;

        $totalAuthors = Author::query()->count();
        $royaltyOutstanding = RoyaltyCalculation::query()
            ->whereIn('status', [RoyaltyStatus::Draft, RoyaltyStatus::Finalized])
            ->sum('total_amount');

        return [
            Stat::make('Total Naskah', (string)$totalNaskah)
            ->description('Seluruh buku terdaftar')
            ->icon('heroicon-o-book-open'),
            Stat::make('ISBN Bermasalah', (string)$isbnMasalah)
            ->description('Butuh perhatian segera')
            ->color('danger')
            ->icon('heroicon-o-identification'),
            Stat::make('Antrean Cetak', (string)$antreanCetak)
            ->description('Dalam proses produksi')
            ->color('warning')
            ->icon('heroicon-o-printer'),
            Stat::make('Total Omset', 'Rp ' . number_format((float)$totalOmset, 0, ',', '.'))
            ->description('Penjualan seluruh buku')
            ->color('success')
            ->icon('heroicon-o-currency-dollar'),
            Stat::make('Out. Royalty', 'Rp ' . number_format((float)$royaltyOutstanding, 0, ',', '.'))
            ->description('Sisa kewajiban royalti')
            ->icon('heroicon-o-banknotes'),
        ];
    }
}