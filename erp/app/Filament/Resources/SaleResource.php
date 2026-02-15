<?php

namespace App\Filament\Resources;

use App\Filament\Resources\SaleResource\Pages;
use App\Models\Book;
use App\Models\Marketplace;
use App\Models\Sale;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class SaleResource extends Resource
{
    protected static ?string $model = Sale::class;

    protected static ?string $navigationIcon = 'heroicon-o-shopping-bag';

    protected static ?string $navigationGroup = 'ERP';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Select::make('marketplace_id')
                ->options(Marketplace::query()->pluck('name', 'id'))
                ->searchable()
                ->required(),
            Forms\Components\Select::make('book_id')
                ->options(Book::query()->pluck('title', 'id'))
                ->searchable()
                ->required(),
            Forms\Components\TextInput::make('transaction_id')->required()->maxLength(255),
            Forms\Components\TextInput::make('period_month')
                ->required()
                ->placeholder('YYYY-MM')
                ->maxLength(7),
            Forms\Components\TextInput::make('quantity')->numeric()->required()->minValue(1),
            Forms\Components\TextInput::make('net_price')->numeric()->required()->minValue(0),
            Forms\Components\Select::make('status')
                ->options([
                    'completed' => 'Completed',
                    'refunded' => 'Refunded',
                ])
                ->required(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('period_month')->sortable(),
                Tables\Columns\TextColumn::make('book.title')->searchable(),
                Tables\Columns\TextColumn::make('marketplace.code')->searchable(),
                Tables\Columns\TextColumn::make('transaction_id')->searchable(),
                Tables\Columns\TextColumn::make('quantity')->numeric(),
                Tables\Columns\TextColumn::make('net_price')->money(config('erp.currency')),
                Tables\Columns\TextColumn::make('status')->badge(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'completed' => 'Completed',
                        'refunded' => 'Refunded',
                    ]),
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
            'index' => Pages\ListSales::route('/'),
            'create' => Pages\CreateSale::route('/create'),
            'edit' => Pages\EditSale::route('/{record}/edit'),
        ];
    }
}
