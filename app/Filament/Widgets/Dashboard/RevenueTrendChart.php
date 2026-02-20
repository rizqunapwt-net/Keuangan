<?php

namespace App\Filament\Widgets\Dashboard;

use App\Models\Sale;
use Filament\Widgets\ChartWidget;
use Flowframe\Trend\Trend;
use Flowframe\Trend\TrendValue;

class RevenueTrendChart extends ChartWidget
{
    protected static ?string $heading = 'Revenue Trend';

    protected static ?int $sort = 2; // Position next to KPI Overview

    protected int | string | array $columnSpan = 'half';

    protected function getData(): array
    {
        $data = Trend::model(Sale::class)
            ->between(
                start: now()->startOfYear(),
                end: now()->endOfYear(),
            )
            ->perMonth()
            ->sum('quantity * net_price'); // We use quantity * price for simplicity now

        return [
            'datasets' => [
                [
                    'label' => 'Total Revenue',
                    'data' => $data->map(fn (TrendValue $value) => $value->aggregate),
                    'backgroundColor' => '#6366f1', // Indigo to match theme
                    'borderColor' => '#6366f1',
                    'tension' => 0.4,
                ],
            ],
            'labels' => $data->map(fn (TrendValue $value) => $value->date),
        ];
    }

    protected function getType(): string
    {
        return 'line';
    }
}