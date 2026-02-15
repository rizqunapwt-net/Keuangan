<?php

namespace App\Filament\Resources;

use App\Domain\Payments\PaymentService;
use App\Filament\Resources\PaymentResource\Pages;
use App\Models\Payment;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class PaymentResource extends Resource
{
    protected static ?string $model = Payment::class;

    protected static ?string $navigationIcon = 'heroicon-o-banknotes';

    protected static ?string $navigationGroup = 'ERP';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Select::make('royalty_calculation_id')
                ->relationship('calculation', 'id')
                ->required(),
            Forms\Components\TextInput::make('invoice_number')->required()->maxLength(255),
            Forms\Components\TextInput::make('invoice_path')->maxLength(255),
            Forms\Components\TextInput::make('amount')->required()->numeric(),
            Forms\Components\Select::make('status')
                ->options([
                    'unpaid' => 'Unpaid',
                    'paid' => 'Paid',
                ])
                ->required(),
            Forms\Components\DateTimePicker::make('paid_at'),
            Forms\Components\TextInput::make('payment_reference')->maxLength(255),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('invoice_number')->searchable(),
                Tables\Columns\TextColumn::make('calculation.period_month')->label('Period'),
                Tables\Columns\TextColumn::make('amount')->money(config('erp.currency')),
                Tables\Columns\TextColumn::make('status')->badge(),
                Tables\Columns\TextColumn::make('paid_at')->dateTime(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'unpaid' => 'Unpaid',
                        'paid' => 'Paid',
                    ]),
            ])
            ->actions([
                Tables\Actions\Action::make('mark_paid')
                    ->label('Mark Paid')
                    ->color('success')
                    ->visible(fn (Payment $record): bool => $record->status->value === 'unpaid')
                    ->action(function (Payment $record): void {
                        app(PaymentService::class)->markPaid($record, auth()->user());
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
            'index' => Pages\ListPayments::route('/'),
            'create' => Pages\CreatePayment::route('/create'),
            'edit' => Pages\EditPayment::route('/{record}/edit'),
        ];
    }
}
