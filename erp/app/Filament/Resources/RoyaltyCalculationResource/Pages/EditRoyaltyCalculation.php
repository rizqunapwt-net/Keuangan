<?php

namespace App\Filament\Resources\RoyaltyCalculationResource\Pages;

use App\Filament\Resources\RoyaltyCalculationResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditRoyaltyCalculation extends EditRecord
{
    protected static string $resource = RoyaltyCalculationResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
