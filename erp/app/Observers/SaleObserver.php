<?php

namespace App\Observers;

use App\Models\Sale;
use App\Models\Book;
use App\Models\Contract;
use App\Models\RoyaltyCalculation;
use App\Models\RoyaltyItem;
use App\Enums\ContractStatus;
use App\Enums\RoyaltyStatus;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class SaleObserver
{
    /**
     * Handle the Sale "created" event.
     */
    public function created(Sale $sale): void
    {
        DB::transaction(function () use ($sale) {
            // 1. Decrement Book Stock
            $book = $sale->book;
            if ($book) {
                $book->decrement('stock', $sale->quantity);

                // 3. Proactive Alert: Low Stock
                if ($book->stock <= 10) {
                    $admins = \App\Models\User::role('Admin')->get();
                    if ($admins->isEmpty()) {
                        // Fallback if Spatie role not found but role field used
                        $admins = \App\Models\User::whereIn('role', ['ADMIN', 'OWNER'])->get();
                    }

                    \Illuminate\Support\Facades\Notification::send($admins, new \App\Notifications\LowStockAlert($book));
                }
            }

            // 2. Auto-Calculate Royalty
            $this->processRoyalty($sale);

            // 3. Auto-Accounting (Journal Entry) - Only for manual sales
            if (!$sale->sales_import_id) {
                $this->processAccounting($sale);
            }
        });
    }

    /**
     * Process automated accounting for a sale.
     */
    protected function processAccounting(Sale $sale): void
    {
        $arAccount = \App\Models\Accounting\Account::where('code', '1200')->first(); // Piutang Usaha
        $salesAccount = \App\Models\Accounting\Account::where('code', '4000')->first(); // Penjualan Buku

        if (!$arAccount || !$salesAccount)
            return;

        $totalAmount = $sale->net_price * $sale->quantity;

        $journal = \App\Models\Accounting\Journal::create([
            'date' => now(),
            'reference' => "SALE-{$sale->transaction_id}",
            'description' => "Penjualan Otomatis: {$sale->book->title} x {$sale->quantity}",
            'total_amount' => $totalAmount,
            'status' => 'draft', // Draft by default for review
        ]);

        $journal->entries()->createMany([
            [
                'account_id' => $arAccount->id,
                'type' => 'debit',
                'amount' => $totalAmount,
                'memo' => "Piutang Penjualan {$sale->transaction_id}",
            ],
            [
                'account_id' => $salesAccount->id,
                'type' => 'credit',
                'amount' => $totalAmount,
                'memo' => "Pendapatan Penjualan {$sale->transaction_id}",
            ],
        ]);
    }

    /**
     * Handle the Sale "deleted" event.
     */
    public function deleted(Sale $sale): void
    {
        DB::transaction(function () use ($sale) {
            // 1. Restore Book Stock
            $book = $sale->book;
            if ($book) {
                $book->increment('stock', $sale->quantity);
            }

            // 2. Remove Royalty Item and update Calculation
            $royaltyItem = RoyaltyItem::where('sale_id', $sale->id)->first();
            if ($royaltyItem) {
                $calculation = $royaltyItem->calculation;
                if ($calculation && $calculation->status === RoyaltyStatus::Draft) {
                    $calculation->decrement('total_amount', $royaltyItem->amount);
                    $royaltyItem->delete();
                }
            }
        });
    }

    /**
     * Process royalty logic for a sale.
     */
    protected function processRoyalty(Sale $sale): void
    {
        $book = $sale->book;
        if (!$book)
            return;

        $periodDate = Carbon::createFromFormat('Y-m', $sale->period_month);
        $periodStart = $periodDate->copy()->startOfMonth();
        $periodEnd = $periodDate->copy()->endOfMonth();

        // Find active approved contract
        $contract = Contract::query()
            ->where('book_id', $sale->book_id)
            ->where('status', ContractStatus::Approved)
            ->whereDate('start_date', '<=', $periodEnd)
            ->whereDate('end_date', '>=', $periodStart)
            ->first();

        if (!$contract)
            return;

        // Find or create RoyaltyCalculation parent (Draft only)
        $calculation = RoyaltyCalculation::firstOrCreate(
        [
            'period_month' => $sale->period_month,
            'author_id' => $book->author_id,
        ],
        [
            'status' => RoyaltyStatus::Draft,
            'total_amount' => 0,
        ]
        );

        // Only add items to Draft calculations
        if ($calculation->status !== RoyaltyStatus::Draft) {
            return;
        }

        // Calculate amount
        $royaltyAmount = ($sale->net_price * $sale->quantity) * ($contract->royalty_percentage / 100);

        // Create RoyaltyItem
        RoyaltyItem::create([
            'royalty_calculation_id' => $calculation->id,
            'sale_id' => $sale->id,
            'book_id' => $sale->book_id,
            'quantity' => $sale->quantity,
            'net_price' => $sale->net_price,
            'royalty_percentage' => $contract->royalty_percentage,
            'amount' => $royaltyAmount,
        ]);

        // Update parent total
        $calculation->increment('total_amount', $royaltyAmount);
    }
}