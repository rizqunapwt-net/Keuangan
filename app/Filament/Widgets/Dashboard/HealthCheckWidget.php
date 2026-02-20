<?php

namespace App\Filament\Widgets\Dashboard;

use App\Models\Accounting\JournalEntry;
use App\Models\Accounting\Account;
use Filament\Widgets\Widget;
use Illuminate\Support\Facades\DB;

class HealthCheckWidget extends Widget
{
    protected static string $view = 'filament.widgets.dashboard.health-check-widget';

    protected static ?int $sort = 1; // Between Summary widgets

    protected int|string|array $columnSpan = 'full';

    public function getHealthData(): array
    {
        // 1. Calculate Current Assets (Code 1xxx)
        $assets = JournalEntry::whereHas('account', fn($q) => $q->where('code', 'like', '1%'))
            ->sum(DB::raw("CASE WHEN type = 'debit' THEN amount ELSE -amount END"));

        // 2. Calculate Current Liabilities (Code 2xxx)
        $liabilities = JournalEntry::whereHas('account', fn($q) => $q->where('code', 'like', '2%'))
            ->sum(DB::raw("CASE WHEN type = 'credit' THEN amount ELSE -amount END"));

        // 3. Liquidity Ratio
        $ratio = $liabilities > 0 ? ($assets / $liabilities) : 100;

        // 4. Determine status
        if ($ratio >= 2.0) {
            $status = 'excellent';
            $message = 'Your financial position is robust. You have significant liquidity to cover all liabilities.';
            $color = 'emerald';
            $score = 95;
        }
        elseif ($ratio >= 1.2) {
            $status = 'healthy';
            $message = 'Good liquidity. You can comfortably meet your short-term obligations.';
            $color = 'sky';
            $score = 75;
        }
        elseif ($ratio >= 1.0) {
            $status = 'warning';
            $message = 'Tight liquidity. Monitor your cash flow closely to avoid payment delays.';
            $color = 'amber';
            $score = 45;
        }
        else {
            $status = 'critical';
            $message = 'Danger! Liabilities exceed current assets. Immediate cash injection or restructuring needed.';
            $color = 'rose';
            $score = 15;
        }

        return [
            'ratio' => number_format($ratio, 2),
            'status' => $status,
            'message' => $message,
            'color' => $color,
            'score' => $score,
            'assets' => $assets,
            'liabilities' => $liabilities,
        ];
    }
}