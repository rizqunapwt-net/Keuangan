<?php

namespace App\Observers\Accounting;

use App\Models\Accounting\Journal;
use App\Models\Accounting\Period;
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
                'date' => "Transaksi tidak dapat disimpan. Periode $periodMonth sudah ditutup (Closed)."
            ]);
        }
    }

    /**
     * Handle the Journal "deleting" event.
     */
    public function deleting(Journal $journal): void
    {
        $periodMonth = $journal->date->format('Y-m');

        if (Period::isClosed($periodMonth)) {
            throw ValidationException::withMessages([
                'date' => "Transaksi tidak dapat dihapus. Periode $periodMonth sudah ditutup (Closed)."
            ]);
        }
    }
}