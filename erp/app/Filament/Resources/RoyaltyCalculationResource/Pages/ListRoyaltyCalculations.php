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
        ];
    }
}
