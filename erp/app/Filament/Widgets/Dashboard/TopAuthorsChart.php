<?php

namespace App\Filament\Widgets\Dashboard;

use App\Services\AnalyticsService;
use Filament\Widgets\ChartWidget;

class TopAuthorsChart extends ChartWidget
{
    protected static ?string $heading = 'Top 5 Penulis (Berdasarkan Omset)';
    protected static ?int $sort = 3;
    protected static string $color = 'info';

    protected function getData(): array
    {
        $analytics = app(AnalyticsService::class);
        $authors = $analytics->getTopAuthors(5);

        return [
            'datasets' => [
                [
                    'label' => 'Total Revenue',
                    'data' => collect($authors)->pluck('total_revenue')->toArray(),
                    'backgroundColor' => [
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                    ],
                    'borderColor' => [
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 99, 132, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                    ],
                    'borderWidth' => 1,
                ],
            ],
            'labels' => collect($authors)->pluck('name')->toArray(),
        ];
    }

    protected function getType(): string
    {
        return 'bar';
    }
}