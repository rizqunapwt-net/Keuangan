<?php

namespace App\Filament\Widgets\Dashboard;

use App\Models\Book;
use Filament\Widgets\ChartWidget;

class PipelineChart extends ChartWidget
{
    protected static ?string $heading = 'Book Production Pipeline';

    protected static ?int $sort = 3;

    protected int|string|array $columnSpan = 'half';

    protected function getData(): array
    {
        $statusCounts = Book::selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        return [
            'datasets' => [
                [
                    'label' => 'Total Books',
                    'data' => $statusCounts->values()->toArray(),
                    'backgroundColor' => [
                        '#94a3b8', // Draft (Gray)
                        '#fbbf24', // Review (Yellow)
                        '#f87171', // Editing (Red)
                        '#a78bfa', // Layout (Purple)
                        '#34d399', // Published (Green)
                        '#60a5fa', // Reprint (Blue)
                    ],
                ],
            ],
            'labels' => $statusCounts->keys()->map(fn($status) => ucfirst(str_replace('_', ' ', $status)))->toArray(),
        ];
    }

    protected function getType(): string
    {
        return 'doughnut';
    }
}