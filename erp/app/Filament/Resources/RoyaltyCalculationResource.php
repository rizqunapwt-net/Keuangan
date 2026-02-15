<?php

namespace App\Filament\Resources;

use App\Domain\Payments\PaymentService;
use App\Domain\Royalty\RoyaltyCalculationService;
use App\Filament\Resources\RoyaltyCalculationResource\Pages;
use App\Models\RoyaltyCalculation;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class RoyaltyCalculationResource extends Resource
{
    protected static ?string $model = RoyaltyCalculation::class;

    protected static ?string $navigationIcon = 'heroicon-o-calculator';

    protected static ?string $navigationGroup = 'ERP';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\TextInput::make('period_month')->required()->maxLength(7),
            Forms\Components\Select::make('author_id')->relationship('author', 'name')->required(),
            Forms\Components\TextInput::make('total_amount')->numeric()->required(),
            Forms\Components\Select::make('status')
                ->options([
                    'draft' => 'Draft',
                    'finalized' => 'Finalized',
                    'paid' => 'Paid',
                ])
                ->required(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('period_month')->sortable(),
                Tables\Columns\TextColumn::make('author.name')->searchable(),
                Tables\Columns\TextColumn::make('total_amount')->money(config('erp.currency')),
                Tables\Columns\TextColumn::make('status')->badge(),
                Tables\Columns\TextColumn::make('updated_at')->dateTime(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'draft' => 'Draft',
                        'finalized' => 'Finalized',
                        'paid' => 'Paid',
                    ]),
            ])
            ->actions([
                Tables\Actions\Action::make('finalize')
                    ->label('Finalize')
                    ->color('warning')
                    ->visible(fn (RoyaltyCalculation $record): bool => $record->status->value === 'draft')
                    ->action(function (RoyaltyCalculation $record): void {
                        app(RoyaltyCalculationService::class)->finalize($record, auth()->user());
                    }),
                Tables\Actions\Action::make('generate_invoice')
                    ->label('Generate Invoice')
                    ->color('success')
                    ->visible(fn (RoyaltyCalculation $record): bool => $record->status->value === 'finalized')
                    ->action(function (RoyaltyCalculation $record): void {
                        app(PaymentService::class)->generateInvoice($record, auth()->user());
                    }),
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
            'index' => Pages\ListRoyaltyCalculations::route('/'),
            'create' => Pages\CreateRoyaltyCalculation::route('/create'),
            'edit' => Pages\EditRoyaltyCalculation::route('/{record}/edit'),
        ];
    }
}
