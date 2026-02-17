<?php

namespace App\Filament\Widgets\Dashboard;

use App\Models\Sale;
use App\Models\Book;
use Filament\Widgets\TableWidget as BaseWidget;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Facades\DB;

class TopSellingBooksWidget extends BaseWidget
{
    protected static ?string $heading = 'Top Selling Books (This Month)';

    protected static ?int $sort = 3;

    protected int|string|array $columnSpan = 'half';

    public function table(Table $table): Table
    {
        return $table
            ->query(
            Book::query()
            ->withSum(['sales' => function ($query) {
            $query->whereMonth('created_at', now()->month);
        }], 'quantity')
            ->orderByDesc('sales_sum_quantity')
            ->limit(5)
        )
            ->columns([
            Tables\Columns\TextColumn::make('title')
            ->label('Book Title')
            ->weight('bold')
            ->searchable(),
            Tables\Columns\TextColumn::make('sales_sum_quantity')
            ->label('Units Sold')
            ->numeric()
            ->alignRight()
            ->color('info'),
            Tables\Columns\TextColumn::make('stock')
            ->label('Rem. Stock')
            ->numeric()
            ->alignRight()
            ->color(fn($state) => $state < 10 ? 'danger' : 'gray'),
        ])
            ->paginated(false);
    }
}