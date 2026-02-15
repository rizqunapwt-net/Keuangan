<?php

namespace App\Filament\Resources;

use App\Filament\Resources\MarketplaceResource\Pages;
use App\Models\Marketplace;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class MarketplaceResource extends Resource
{
    protected static ?string $model = Marketplace::class;

    protected static ?string $navigationIcon = 'heroicon-o-building-storefront';

    protected static ?string $navigationGroup = 'ERP';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\TextInput::make('code')->required()->maxLength(50),
            Forms\Components\TextInput::make('name')->required()->maxLength(255),
            Forms\Components\Toggle::make('is_active')->default(true),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('code')->searchable(),
                Tables\Columns\TextColumn::make('name')->searchable(),
                Tables\Columns\IconColumn::make('is_active')->boolean(),
                Tables\Columns\TextColumn::make('updated_at')->dateTime(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListMarketplaces::route('/'),
            'create' => Pages\CreateMarketplace::route('/create'),
            'edit' => Pages\EditMarketplace::route('/{record}/edit'),
        ];
    }
}
