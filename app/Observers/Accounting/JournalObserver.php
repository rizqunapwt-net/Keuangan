<?php

namespace App\Observers\Accounting;

use App\Models\Accounting\Journal;
use App\Models\Accounting\Period;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\ValidationException;

class JournalObserver
{
    /**
     * Handle the Journal "saving" event.
     */
    public function saving(Journal $journal): void
    {
        $periodMonth = $journal->date->format('Y-m');

        if (Period::isClosed($periodMonth)) {
            throw ValidationException::withMessages([
                'date' => "Transaksi tidak dapat disimpan. Periode $periodMonth sudah ditutup (Closed).",
            ]);
        }
    }

    /**
     * Handle the Journal "saved" event - Clear report caches
     */
    public function saved(Journal $journal): void
    {
        // Clear all report caches for the affected period
        $yearMonth = $journal->date->format('Y-m');
        $startDate = $journal->date->copy()->startOfMonth()->format('Y-m-d');
        $endDate = $journal->date->copy()->endOfMonth()->format('Y-m-d');

        // Clear profit & loss cache for all periods that could be affected
        Cache::forget("report.profit_loss.{$startDate}.{$endDate}");

        // Clear balance sheet cache for all dates in the month
        $date = $journal->date->copy();
        while ($date->day <= $journal->date->copy()->endOfMonth()->day) {
            Cache::forget("report.balance_sheet.{$date->format('Y-m-d')}");
            $date->addDay();
        }

        // Clear cash flow cache
        Cache::forget("report.cash_flow.{$startDate}.{$endDate}");
    }

    /**
     * Handle the Journal "deleting" event.
     */
    public function deleting(Journal $journal): void
    {
        $periodMonth = $journal->date->format('Y-m');

        if (Period::isClosed($periodMonth)) {
            throw ValidationException::withMessages([
                'date' => "Transaksi tidak dapat dihapus. Periode $periodMonth sudah ditutup (Closed).",
            ]);
        }

        // Clear caches before deletion
        $this->saved($journal);
    }
}
