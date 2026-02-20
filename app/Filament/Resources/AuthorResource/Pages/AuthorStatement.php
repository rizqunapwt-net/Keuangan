<?php

namespace App\Filament\Resources\AuthorResource\Pages;

use App\Filament\Resources\AuthorResource;
use App\Models\Payment;
use App\Models\RoyaltyCalculation;
use Filament\Resources\Pages\Concerns\InteractsWithRecord;
use Filament\Resources\Pages\Page;
use Illuminate\Support\Collection;

class AuthorStatement extends Page
{
    use InteractsWithRecord;

    protected static string $resource = AuthorResource::class;

    protected static string $view = 'filament.resources.author-resource.pages.author-statement';

    protected static ?string $title = 'Statement of Account';

    public function mount(int|string $record): void
    {
        $this->record = $this->resolveRecord($record);
    }

    public function getTransactions(): Collection
    {
        $authorId = $this->record->id;

        // 1. Get Royalty Calculations (Debits to company's debt = Credits for Author Statement)
        $royalties = RoyaltyCalculation::where('author_id', $authorId)
            ->where('status', '!=', 'draft')
            ->get()
            ->map(fn($item) => [
        'date' => $item->finalized_at ?? $item->created_at,
        'description' => "Royalty Calculation for " . $item->period_month,
        'reference' => "RC-" . $item->id,
        'amount' => $item->total_amount,
        'type' => 'royalty',
        ]);

        // 2. Get Payments (Actual cash sent)
        $payments = Payment::whereHas('royaltyCalculation', fn($q) => $q->where('author_id', $authorId))
            ->get()
            ->map(fn($item) => [
        'date' => $item->paid_at ?? $item->created_at,
        'description' => "Payment for Royalty " . ($item->royaltyCalculation->period_month ?? ''),
        'reference' => $item->reference ?? ("PAY-" . $item->id),
        'amount' => $item->amount,
        'type' => 'payment',
        ]);

        // Combine and Sort
        $all = $royalties->concat($payments)->sortBy('date');

        // Calculate Running Balance
        $balance = 0;
        return $all->map(function ($item) use (&$balance) {
            // Royalty increases Debt (Balance)
            // Payment decreases Debt (Balance)
            if ($item['type'] === 'royalty') {
                $balance += $item['amount'];
            }
            else {
                $balance -= $item['amount'];
            }
            $item['balance'] = $balance;
            return (object)$item;
        });
    }

    protected function getHeaderWidgets(): array
    {
        return [
            // Potentially add summary stats here later
        ];
    }
}