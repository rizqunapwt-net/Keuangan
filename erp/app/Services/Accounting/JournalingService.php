<?php

namespace App\Services\Accounting;

use App\Models\Accounting\Account;
use App\Models\Accounting\Journal;
use App\Models\Accounting\JournalEntry;
use App\Models\RoyaltyCalculation;
use App\Models\SalesImport;
use Illuminate\Support\Facades\DB;

class JournalingService
{
    /**
     * Record Sales Import to Journal
     * Debit: Piutang Usaha (1200)
     * Credit: Penjualan Buku - Marketplace (4001)
     */
    public function recordSalesImport(SalesImport $import): ?Journal
    {
        // Calculate total net price from imported sales
        $totalAmount = $import->sales()->sum('net_price');

        if ($totalAmount <= 0) {
            return null;
        }

        return DB::transaction(function () use ($import, $totalAmount) {
            $journal = Journal::create([
                'date' => now(),
                'reference' => 'IMPORT-' . $import->id,
                'description' => "Penjualan Marketplace Periode {$import->period_month} (Batch #{$import->id})",
                'total_amount' => $totalAmount,
                'status' => 'posted',
                'created_by' => $import->imported_by,
            ]);

            // Entry 1: Debit Piutang Usaha
            $arAccount = Account::where('code', '1200')->first();
            JournalEntry::create([
                'journal_id' => $journal->id,
                'account_id' => $arAccount->id,
                'type' => 'debit',
                'amount' => $totalAmount,
                'memo' => 'Piutang Penjualan Marketplace',
            ]);

            // Entry 2: Credit Pendapatan Penjualan
            $revenueAccount = Account::where('code', '4001')->first();
            JournalEntry::create([
                'journal_id' => $journal->id,
                'account_id' => $revenueAccount->id,
                'type' => 'credit',
                'amount' => $totalAmount,
                'memo' => 'Pendapatan Penjualan Buku',
            ]);

            return $journal;
        });
    }

    /**
     * Record Royalty Finalization to Journal
     * Debit: Beban Royalti Penulis (5101)
     * Credit: Hutang Royalti Penulis (2101)
     */
    public function recordRoyaltyFinalization(RoyaltyCalculation $calculation): ?Journal
    {
        if ($calculation->total_amount <= 0) {
            return null;
        }

        return DB::transaction(function () use ($calculation) {
            $journal = Journal::create([
                'date' => now(),
                'reference' => 'ROYALTY-' . $calculation->id,
                'description' => "Pengakuan Beban Royalti {$calculation->author->name} Periode {$calculation->period_month}",
                'total_amount' => $calculation->total_amount,
                'status' => 'posted',
                'created_by' => $calculation->finalized_by,
            ]);

            // Entry 1: Debit Beban Royalti
            $expenseAccount = Account::where('code', '5101')->first();
            JournalEntry::create([
                'journal_id' => $journal->id,
                'account_id' => $expenseAccount->id,
                'type' => 'debit',
                'amount' => $calculation->total_amount,
                'memo' => 'Beban Royalti Penulis',
            ]);

            // Entry 2: Credit Hutang Royalti
            $liabilityAccount = Account::where('code', '2101')->first();
            JournalEntry::create([
                'journal_id' => $journal->id,
                'account_id' => $liabilityAccount->id,
                'type' => 'credit',
                'amount' => $calculation->total_amount,
                'memo' => 'Hutang Royalti Penulis',
            ]);

            return $journal;
        });
    }
}