<?php

namespace App\Filament\Pages;

use App\Filament\Widgets\Dashboard\AccountingSummaryWidget;
use App\Filament\Widgets\Dashboard\FinancialSummaryWidget;
use App\Filament\Widgets\Dashboard\KpiOverview;
use App\Filament\Widgets\Dashboard\QuickActionWidget;
use App\Filament\Widgets\Dashboard\RevenueTrendChart;
use App\Filament\Widgets\Dashboard\PipelineChart;
use App\Filament\Widgets\Dashboard\GlobalActivityFeed;
use App\Filament\Widgets\Dashboard\HealthCheckWidget;
use App\Filament\Widgets\Dashboard\TopSellingBooksWidget;
use App\Filament\Widgets\Dashboard\CashFlowChart;
use Filament\Pages\Dashboard as BaseDashboard;

class Dashboard extends BaseDashboard
{
    protected static ?string $title = 'Command Center';

    protected static ?string $navigationIcon = 'heroicon-o-squares-2x2';

    public function getHeaderWidgets(): array
    {
        return [
            QuickActionWidget::class ,
            HealthCheckWidget::class ,
            AccountingSummaryWidget::class ,
            FinancialSummaryWidget::class ,
        ];
    }

    public function getWidgets(): array
    {
        return [
            KpiOverview::class ,
            RevenueTrendChart::class ,
            CashFlowChart::class ,
            TopSellingBooksWidget::class ,
            PipelineChart::class ,
            GlobalActivityFeed::class ,
        ];
    }

    public function getHeaderWidgetsColumns(): int|array
    {
        return 1;
    }
}