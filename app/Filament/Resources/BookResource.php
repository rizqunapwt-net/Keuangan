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
    protected static ?string $recordTitleAttribute = 'title';

    public static function getGloballySearchableAttributes(): array
    {
        return ['title', 'isbn', 'author.name'];
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Select::make('author_id')
                ->label('Author')
                ->relationship('author', 'name')
                ->searchable()
                ->required(),
            Forms\Components\TextInput::make('title')->required()->maxLength(255),
            Forms\Components\TextInput::make('isbn')->maxLength(255),
            Forms\Components\Textarea::make('description')->columnSpanFull(),
            Forms\Components\TextInput::make('price')->required()->numeric()->minValue(0.0),
            Forms\Components\TextInput::make('stock')->numeric()->default(0)->minValue(0)->required(),
            Forms\Components\FileUpload::make('cover_path')
                ->disk(config('filesystems.default'))
                ->directory('books/covers')
                ->image()
                ->maxSize(10240),
            Forms\Components\TextInput::make('tracking_code')
                ->label('Tracking Code')
                ->placeholder('Generated automatically')
                ->disabled()
                ->dehydrated(false),
            Forms\Components\Select::make('status')
                ->options(collect(\App\Enums\BookStatus::cases())->mapWithKeys(fn ($case) => [$case->value => $case->getLabel()])->toArray())
                ->required()
                ->default(\App\Enums\BookStatus::DRAFT->value),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('tracking_code')
                    ->label('Code')
                    ->searchable()
                    ->sortable()
                    ->copyable(),
                Tables\Columns\TextColumn::make('title')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('author.name')->label('Author')->searchable(),
                Tables\Columns\TextColumn::make('isbn')->searchable(),
                Tables\Columns\TextColumn::make('price')->money('IDR'),
                Tables\Columns\TextColumn::make('stock')->numeric()->sortable(),
                Tables\Columns\TextColumn::make('status')->badge(),
                Tables\Columns\TextColumn::make('updated_at')->dateTime()->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options(collect(\App\Enums\BookStatus::cases())->mapWithKeys(fn ($case) => [$case->value => $case->getLabel()])->toArray()),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\Action::make('change_status')
                    ->label('Update Status')
                    ->icon('heroicon-o-arrow-path')
                    ->color('warning')
                    ->form([
                        Forms\Components\Select::make('status')
                            ->options(collect(\App\Enums\BookStatus::cases())->mapWithKeys(fn ($case) => [$case->value => $case->getLabel()])->toArray())
                            ->required(),
                    ])
                    ->action(function (Book $record, array $data): void {
                        $record->update(['status' => $data['status']]);
                    }),
                Tables\Actions\Action::make('share_tracking')
                    ->label('Share')
                    ->icon('heroicon-o-share')
                    ->color('info')
                    ->url(fn (Book $record) => "https://api.whatsapp.com/send?text=" . urlencode("Halo Bapak/Ibu, berikut adalah link untuk memantau status naskah: " . $record->title . "\n\nLink: https://nre.infiatin.cloud/track?code=" . $record->tracking_code), shouldOpenInNewTab: true),
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