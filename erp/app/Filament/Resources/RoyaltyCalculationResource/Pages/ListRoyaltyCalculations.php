<?php

namespace App\Filament\Resources\RoyaltyCalculationResource\Pages;

use App\Filament\Resources\RoyaltyCalculationResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListRoyaltyCalculations extends ListRecords
{
    protected static string $resource = RoyaltyCalculationResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
            Actions\Action::make('export')
            ->label('Export Excel')
            ->icon('heroicon-o-arrow-down-tray')
            ->color('success')
            ->action(fn() => \Maatwebsite\Excel\Facades\Excel::download(new \App\Exports\RoyaltyCalculationExport, 'royalty-calculations.xlsx')),
        ];
    }
}