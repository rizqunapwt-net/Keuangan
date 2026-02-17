<?php

namespace App\Filament\Resources\BookResource\Pages;

use App\Filament\Resources\BookResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListBooks extends ListRecords
{
    protected static string $resource = BookResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }

    public function getTabs(): array
    {
        return [
            'all' => \Filament\Resources\Components\Tab::make('Semua Naskah'),
            'incoming' => \Filament\Resources\Components\Tab::make('Naskah Masuk')
            ->modifyQueryUsing(fn($query) => $query->where('status', \App\Enums\BookStatus::INCOMING)),
            'layouting' => \Filament\Resources\Components\Tab::make('Proses Layout')
            ->modifyQueryUsing(fn($query) => $query->where('status', \App\Enums\BookStatus::LAYOUTING)),
            'isbn' => \Filament\Resources\Components\Tab::make('ISBN Bermasalah')
            ->modifyQueryUsing(fn($query) => $query->where('status', \App\Enums\BookStatus::IS_ISBN_PROCESS)),
            'production' => \Filament\Resources\Components\Tab::make('Antrean Cetak')
            ->modifyQueryUsing(fn($query) => $query->where('status', \App\Enums\BookStatus::PRODUCTION)),
            'published' => \Filament\Resources\Components\Tab::make('Selesai / Terbit')
            ->modifyQueryUsing(fn($query) => $query->where('status', \App\Enums\BookStatus::PUBLISHED)),
        ];
    }
}