<?php

namespace App\Services\Accounting;

use App\Models\Accounting\Period;
use App\Models\Accounting\Journal;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PeriodService
{
    /**
     * Close a period.
     * 1. Ensure no draft journals exist in that month.
     * 2. Mark period as closed.
     */
    public function closePeriod(string $periodMonth, ?string $notes = null): Period
    {
        // Validate format YYYY-MM
        if (!preg_match('/^\d{4}-(0[1-9]|1[0-2])$/', $periodMonth)) {
            throw ValidationException::withMessages(['period_month' => 'Format harus YYYY-MM.']);
        }

        // Check for draft journals in this month
        $hasDrafts = Journal::where('status', 'draft')
            ->whereMonth('date', substr($periodMonth, 5, 2))
            ->whereYear('date', substr($periodMonth, 0, 4))
            ->exists();

        if ($hasDrafts) {
            throw ValidationException::withMessages([
                'period_month' => "Periode $periodMonth tidak dapat ditutup karena masih ada jurnal berstatus 'Draft'."
            ]);
        }

        return DB::transaction(function () use ($periodMonth, $notes) {
            return Period::updateOrCreate(
            ['period_month' => $periodMonth],
            [
                'status' => 'closed',
                'closed_at' => now(),
                'closed_by' => auth()->id(),
                'notes' => $notes,
            ]
            );
        });
    }

    /**
     * Reopen a closed period.
     */
    public function reopenPeriod(string $periodMonth): bool
    {
        $period = Period::where('period_month', $periodMonth)->first();

        if (!$period)
            return false;

        return $period->update([
            'status' => 'open',
            'closed_at' => null,
            'closed_by' => null,
        ]);
    }
}