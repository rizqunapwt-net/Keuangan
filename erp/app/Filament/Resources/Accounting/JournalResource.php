<?php

namespace App\Filament\Resources\Accounting;

use App\Filament\Resources\Accounting\JournalResource\Pages;
use App\Models\Accounting\Account;
use App\Models\Accounting\Journal;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Forms\Get;
use Filament\Forms\Set;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class JournalResource extends Resource
{
    protected static ?string $model = Journal::class;

    protected static ?string $navigationGroup = 'Finance';
    protected static ?string $navigationIcon = 'heroicon-o-document-text';
    protected static ?string $navigationLabel = 'Journal Entries';
    protected static ?int $navigationSort = 2;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Group::make()->schema([
                Forms\Components\Section::make('Header')
                    ->schema([
                        Forms\Components\DatePicker::make('date')
                            ->default(now())
                            ->required(),
                        Forms\Components\TextInput::make('reference')
                            ->placeholder('Inv/Rcpt Number'),
                        Forms\Components\Textarea::make('description')
                            ->columnSpanFull(),
                    ])->columns(2),

                Forms\Components\Section::make('Entries')
                    ->schema([
                        Forms\Components\Repeater::make('entries')
                            ->relationship()
                            ->schema([
                                Forms\Components\Select::make('account_id')
                                    ->label('Account')
                                    ->options(Account::where('is_active', true)->pluck('name', 'id'))
                                    ->searchable()
                                    ->required()
                                    ->reactive()
                                    ->afterStateUpdated(fn ($state, Set $set) => 
                                        $set('code_display', Account::find($state)?->code ?? '')
                                    ),
                                Forms\Components\Select::make('type')
                                    ->options([
                                        'debit' => 'Debit',
                                        'credit' => 'Credit',
                                    ])
                                    ->required(),
                                Forms\Components\TextInput::make('amount')
                                    ->numeric()
                                    ->required()
                                    ->prefix('Rp'),
                                Forms\Components\TextInput::make('memo')
                                    ->placeholder('Line description'),
                            ])
                            ->columns(4)
                            ->defaultItems(2)
                            ->addActionLabel('Add Line')
                            ->live()
                            ->afterStateUpdated(function (Get $get, Set $set) {
                                // Real-time balance check logic could go here
                            }),
                    ]),
            ])->columnSpanFull(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('journal_number')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('date')->date()->sortable(),
                Tables\Columns\TextColumn::make('description')->limit(30),
                Tables\Columns\TextColumn::make('total_amount')->money('IDR'),
                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->colors([
                        'warning' => 'draft',
                        'success' => 'posted',
                    ]),
            ])
            ->defaultSort('date', 'desc')
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
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
            'index' => Pages\ManageJournals::route('/'),
        ];
    }
}