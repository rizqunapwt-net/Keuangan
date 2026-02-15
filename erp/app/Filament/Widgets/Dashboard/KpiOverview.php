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
    protected function getStats(): array
    {
        $totalBooks = Book::query()->count();
        $totalAuthors = Author::query()->count();
        $pendingContracts = Contract::query()->where('status', ContractStatus::Pending)->count();
        $expiringContracts = Contract::query()
            ->where('status', ContractStatus::Approved)
            ->whereDate('end_date', '>=', now()->toDateString())
            ->whereDate('end_date', '<=', now()->addDays(7)->toDateString())
            ->count();
        $royaltyOutstanding = RoyaltyCalculation::query()
            ->whereIn('status', [RoyaltyStatus::Draft, RoyaltyStatus::Finalized])
            ->sum('total_amount');

        return [
            Stat::make('Total Buku', (string) $totalBooks),
            Stat::make('Total Penulis', (string) $totalAuthors),
            Stat::make('Kontrak Pending', (string) $pendingContracts),
            Stat::make('Kontrak Expiring (7 hari)', (string) $expiringContracts),
            Stat::make('Royalti Outstanding', 'Rp '.number_format((float) $royaltyOutstanding, 0, ',', '.')),
        ];
    }
}
