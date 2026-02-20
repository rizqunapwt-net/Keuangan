<?php

namespace App\Filament\Widgets\Dashboard;

use App\Models\Accounting\JournalEntry;
use Filament\Widgets\ChartWidget;
use Flowframe\Trend\Trend;
use Flowframe\Trend\TrendValue;
use Illuminate\Support\Facades\DB;

class CashFlowChart extends ChartWidget
{
    protected static ?string $heading = 'Cash Flow Analysis';

    protected static ?int $sort = 3; 

    protected int | string | array $columnSpan = 'half';

    protected function getData(): array
    {
        // Cash In (Debit of Cash Accounts)
        $cashIn = Trend::query(
            JournalEntry::whereHas('account', fn($q) => $q->where('code', 'like', '1%'))
                ->where('type', 'debit')
        )
        ->between(start: now()->subMonths(6), end: now())
        ->perMonth()
        ->sum('amount');

        // Cash Out (Credit of Cash Accounts)
        $cashOut = Trend::query(
            JournalEntry::whereHas('account', fn($q) => $q->where('code', 'like', '1%'))
                ->where('type', 'credit')
        )
        ->between(start: now()->subMonths(6), end: now())
        ->perMonth()
        ->sum('amount');

        return [
            'datasets' => [
                [
                    'label' => 'Cash In',
                    'data' => $cashIn->map(fn (TrendValue $value) => $value->aggregate),
                    'borderColor' => '#10b981',
                    'backgroundColor' => '#10b98122',
                    'fill' => 'start',
                ],
                [
                    'label' => 'Cash Out',
                    'data' => $cashOut->map(fn (TrendValue $value) => $value->aggregate),
                    'borderColor' => '#f43f5e',
                    'backgroundColor' => '#f43f5e22',
                    'fill' => 'start',
                ],
            ],
            'labels' => $cashIn->map(fn (TrendValue $value) => $value->date),
        ];
    }

    protected function getType(): string
    {
        return 'line';
    }
}