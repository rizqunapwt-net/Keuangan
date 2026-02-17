<?php

namespace App\Filament\Widgets\Dashboard;

use Filament\Widgets\Widget;

class QuickActionWidget extends Widget
{
    protected static string $view = 'filament.widgets.dashboard.quick-action-widget';

    protected static ?int $sort = -2; // Always at the top

    protected static bool $isLazy = false;

    protected int|string|array $columnSpan = 'full';
}