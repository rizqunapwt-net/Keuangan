<?php

namespace App\Filament\Resources;

use App\Filament\Resources\BookResource\Pages;
use App\Models\Author;
use App\Models\Book;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class BookResource extends Resource
{
    protected static ?string $model = Book::class;

    protected static ?string $navigationIcon = 'heroicon-o-book-open';

    protected static ?string $navigationGroup = 'ERP';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Select::make('author_id')
                ->label('Author')
                ->options(Author::query()->pluck('name', 'id'))
                ->searchable()
                ->required(),
            Forms\Components\TextInput::make('title')->required()->maxLength(255),
            Forms\Components\TextInput::make('isbn')->maxLength(255),
            Forms\Components\Textarea::make('description')->columnSpanFull(),
            Forms\Components\TextInput::make('price')->required()->numeric()->minValue(0),
            Forms\Components\FileUpload::make('cover_path')
                ->disk(config('filesystems.default'))
                ->directory('books/covers')
                ->image()
                ->maxSize(10240),
            Forms\Components\Select::make('status')
                ->options([
                    'draft' => 'Draft',
                    'published' => 'Published',
                    'archived' => 'Archived',
                ])
                ->required()
                ->default('draft'),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('title')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('author.name')->label('Author')->searchable(),
                Tables\Columns\TextColumn::make('isbn')->searchable(),
                Tables\Columns\TextColumn::make('price')->money(config('erp.currency')),
                Tables\Columns\TextColumn::make('status')->badge(),
                Tables\Columns\TextColumn::make('updated_at')->dateTime()->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'draft' => 'Draft',
                        'published' => 'Published',
                        'archived' => 'Archived',
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
            'index' => Pages\ListBooks::route('/'),
            'create' => Pages\CreateBook::route('/create'),
            'edit' => Pages\EditBook::route('/{record}/edit'),
        ];
    }
}
