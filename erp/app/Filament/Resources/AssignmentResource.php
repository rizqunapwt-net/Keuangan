<?php

namespace App\Filament\Resources;

use App\Filament\Resources\AssignmentResource\Pages;
use App\Models\Assignment;
use App\Models\Book;
use App\Models\Marketplace;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class AssignmentResource extends Resource
{
    protected static ?string $model = Assignment::class;

    protected static ?string $navigationIcon = 'heroicon-o-link';

    protected static ?string $navigationGroup = 'ERP';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Select::make('book_id')
                ->options(Book::query()->pluck('title', 'id'))
                ->searchable()
                ->required(),
            Forms\Components\Select::make('marketplace_id')
                ->options(Marketplace::query()->pluck('name', 'id'))
                ->searchable()
                ->required(),
            Forms\Components\TextInput::make('product_url')->url()->maxLength(255),
            Forms\Components\Select::make('posting_status')
                ->options([
                    'draft' => 'Draft',
                    'posted' => 'Posted',
                    'removed' => 'Removed',
                ])
                ->required()
                ->default('draft'),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('book.title')->searchable(),
                Tables\Columns\TextColumn::make('marketplace.name')->searchable(),
                Tables\Columns\TextColumn::make('posting_status')->badge(),
                Tables\Columns\TextColumn::make('product_url')->limit(40),
                Tables\Columns\TextColumn::make('updated_at')->dateTime(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('posting_status')
                    ->options([
                        'draft' => 'Draft',
                        'posted' => 'Posted',
                        'removed' => 'Removed',
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
            'index' => Pages\ListAssignments::route('/'),
            'create' => Pages\CreateAssignment::route('/create'),
            'edit' => Pages\EditAssignment::route('/{record}/edit'),
        ];
    }
}
