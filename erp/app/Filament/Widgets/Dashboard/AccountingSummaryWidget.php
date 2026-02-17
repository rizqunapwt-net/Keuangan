<?php

namespace App\Filament\Widgets\Dashboard;

use App\Models\Accounting\JournalEntry;
use App\Models\Accounting\Account;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class AccountingSummaryWidget extends BaseWidget
{
    protected static ?int $sort = -1;

    protected static bool $isLazy = false;

    protected function getStats(): array
    {
        // 1. Calculate Cash & Bank (Asset Type)
        $cashBalance = JournalEntry::whereHas('account', function ($query) {
            $query->where('type', 'asset')->where('code', 'like', '10%'); // Kas & Bank biasanya diawali angka 10
        })->sum(\Illuminate\Support\Facades\DB::raw("CASE WHEN type = 'debit' THEN amount ELSE -amount END"));

        // 2. Monthly Revenue (Laba Rugi)
        $revenue = JournalEntry::whereHas('account', function ($query) {
            $query->where('type', 'revenue');
        })->whereHas('journal', function ($query) {
            $query->whereMonth('date', now()->month);
        })->sum('amount');

        // 3. Pending Receivables (Piutang)
        $receivables = JournalEntry::whereHas('account', function ($query) {
            $query->where('code', '1200'); // AR Account based on our previous setup
        })->sum(\Illuminate\Support\Facades\DB::raw("CASE WHEN type = 'debit' THEN amount ELSE -amount END"));

        return [
            Stat::make('Cash Position', 'Rp ' . number_format($cashBalance, 0, ',', '.'))
            ->description('Total liquity across all accounts')
            ->descriptionIcon('heroicon-m-banknotes')
            ->color('success')
            ->chart([7, 2, 10, 3, 15, 4, 17]),

            Stat::make('Monthly Revenue', 'Rp ' . number_format($revenue, 0, ',', '.'))
            ->description('Total earnings this month')
            ->descriptionIcon('heroicon-m-arrow-trending-up')
            ->color('info')
            ->chart([3, 5, 8, 10, 12, 15, 20]),

            Stat::make('Pending Receivables', 'Rp ' . number_format($receivables, 0, ',', '.'))
            ->description('Total customer credit')
            ->descriptionIcon('heroicon-m-clock')
            ->color('warning')
            ->chart([15, 12, 10, 8, 10, 12, 14]),
        ];
    }
}