<?php

namespace App\Filament\Resources;

use App\Domain\Contracts\ContractService;
use App\Filament\Resources\ContractResource\Pages;
use App\Models\Book;
use App\Models\Contract;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class ContractResource extends Resource
{
    protected static ?string $model = Contract::class;

    protected static ?string $navigationIcon = 'heroicon-o-document-text';

    protected static ?string $navigationGroup = 'ERP';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Select::make('book_id')
                ->label('Book')
                ->options(Book::query()->pluck('title', 'id'))
                ->searchable()
                ->required(),
            Forms\Components\FileUpload::make('contract_file_path')
                ->label('Contract File')
                ->disk(config('filesystems.default'))
                ->directory('contracts')
                ->acceptedFileTypes(['application/pdf'])
                ->required(),
            Forms\Components\DatePicker::make('start_date')->required(),
            Forms\Components\DatePicker::make('end_date')->required()->after('start_date'),
            Forms\Components\TextInput::make('royalty_percentage')
                ->required()
                ->numeric()
                ->minValue(0)
                ->maxValue(100),
            Forms\Components\Select::make('status')
                ->options([
                    'pending' => 'Pending',
                    'approved' => 'Approved',
                    'rejected' => 'Rejected',
                    'expired' => 'Expired',
                ])
                ->required(),
            Forms\Components\Textarea::make('rejected_reason')->columnSpanFull(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('book.title')->label('Book')->searchable(),
                Tables\Columns\TextColumn::make('royalty_percentage')->suffix('%')->sortable(),
                Tables\Columns\TextColumn::make('start_date')->date(),
                Tables\Columns\TextColumn::make('end_date')->date(),
                Tables\Columns\TextColumn::make('status')->badge(),
                Tables\Columns\TextColumn::make('updated_at')->dateTime(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'pending' => 'Pending',
                        'approved' => 'Approved',
                        'rejected' => 'Rejected',
                        'expired' => 'Expired',
                    ]),
            ])
            ->actions([
                Tables\Actions\Action::make('approve')
                    ->label('Approve')
                    ->color('success')
                    ->icon('heroicon-o-check')
                    ->visible(fn (Contract $record): bool => $record->status->value !== 'approved')
                    ->action(function (Contract $record): void {
                        app(ContractService::class)->approve($record, auth()->user());
                    }),
                Tables\Actions\Action::make('reject')
                    ->label('Reject')
                    ->color('danger')
                    ->icon('heroicon-o-x-mark')
                    ->requiresConfirmation()
                    ->form([
                        Forms\Components\Textarea::make('rejected_reason')->required()->maxLength(1000),
                    ])
                    ->action(function (array $data, Contract $record): void {
                        app(ContractService::class)->reject($record, auth()->user(), $data['rejected_reason']);
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
            'index' => Pages\ListContracts::route('/'),
            'create' => Pages\CreateContract::route('/create'),
            'edit' => Pages\EditContract::route('/{record}/edit'),
        ];
    }
}
