<?php

namespace App\Filament\Widgets\Dashboard;

use App\Models\Accounting\JournalEntry;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Support\Facades\DB;

class FinancialSummaryWidget extends BaseWidget
{
    protected static ?int $sort = 0; // Below Accounting Summary

    protected static bool $isLazy = false;

    protected function getStats(): array
    {
        $currentMonth = now()->month;
        $currentYear = now()->year;

        // 1. Gross Profit Calculation
        $revenue = JournalEntry::whereHas('account', fn($q) => $q->where('type', 'revenue'))
            ->whereHas('journal', fn($q) => $q->whereMonth('date', $currentMonth)->whereYear('date', $currentYear))
            ->sum('amount'); // Credit sum for revenue

        $cogs = JournalEntry::whereHas('account', fn($q) => $q->where('code', '5000'))
            ->whereHas('journal', fn($q) => $q->whereMonth('date', $currentMonth)->whereYear('date', $currentYear))
            ->sum('amount'); // Debit sum for COGS

        $grossProfit = $revenue - $cogs;

        // 2. Net Profit Calculation
        $otherExpenses = JournalEntry::whereHas('account', fn($q) => $q->where('type', 'expense')->where('code', '!=', '5000'))
            ->whereHas('journal', fn($q) => $q->whereMonth('date', $currentMonth)->whereYear('date', $currentYear))
            ->sum('amount');

        $netProfit = $grossProfit - $otherExpenses;

        return [
            Stat::make('Gross Profit', 'Rp ' . number_format($grossProfit, 0, ',', '.'))
            ->description('Revenue after COGS/HPP')
            ->descriptionIcon('heroicon-m-chart-bar')
            ->color('success'),

            Stat::make('Net Profit', 'Rp ' . number_format($netProfit, 0, ',', '.'))
            ->description('Bottom line earnings')
            ->descriptionIcon('heroicon-m-banknotes')
            ->color($netProfit >= 0 ? 'success' : 'danger')
            ->chart([2, 10, 5, 20, 15, 25, 30]),

            Stat::make('OpEx Efficiency', number_format($revenue > 0 ? ($otherExpenses / $revenue) * 100 : 0, 1) . '%')
            ->description('Operational expenses vs revenue')
            ->descriptionIcon('heroicon-m-presentation-chart-line')
            ->color('info'),
        ];
    }
}