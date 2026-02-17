<?php

namespace App\Filament\Resources\Accounting;

use App\Filament\Resources\Accounting\AccountResource\Pages;
use App\Models\Accounting\Account;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class AccountResource extends Resource
{
    protected static ?string $model = Account::class;
    protected static ?string $navigationGroup = 'Finance';
    protected static ?string $navigationIcon = 'heroicon-o-list-bullet';
    protected static ?string $navigationLabel = 'Chart of Accounts';
    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\TextInput::make('code')
                ->required()
                ->numeric()
                ->unique(ignoreRecord: true),
            Forms\Components\TextInput::make('name')->required(),
            Forms\Components\Select::make('type')
                ->options([
                    'asset' => 'Asset (Aktiva)',
                    'liability' => 'Liability (Kewajiban)',
                    'equity' => 'Equity (Modal)',
                    'revenue' => 'Revenue (Pendapatan)',
                    'expense' => 'Expense (Beban)',
                ])
                ->required(),
            Forms\Components\Textarea::make('description'),
            Forms\Components\Toggle::make('is_active')->default(true),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('code')->sortable()->searchable(),
                Tables\Columns\TextColumn::make('name')->searchable(),
                Tables\Columns\TextColumn::make('type')
                    ->badge()
                    ->colors([
                        'success' => 'revenue',
                        'danger' => 'expense',
                        'warning' => 'liability',
                        'info' => 'asset',
                        'gray' => 'equity',
                    ]),
                Tables\Columns\IconColumn::make('is_active')->boolean(),
            ])
            ->defaultSort('code')
            ->filters([
                Tables\Filters\SelectFilter::make('type')
                    ->options([
                        'asset' => 'Asset (Aktiva)',
                        'liability' => 'Liability (Kewajiban)',
                        'equity' => 'Equity (Modal)',
                        'revenue' => 'Revenue (Pendapatan)',
                        'expense' => 'Expense (Beban)',
                    ]),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListAccounts::route('/'),
            'create' => Pages\CreateAccount::route('/create'),
            'edit' => Pages\EditAccount::route('/{record}/edit'),
        ];
    }
}