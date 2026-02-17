<?php

namespace App\Observers;

use App\Models\SalesImport;
use App\Enums\SalesImportStatus;
use App\Services\Accounting\JournalingService;

class SalesImportObserver
{
    public function __construct(protected JournalingService $journalingService)
    {
    }

    /**
     * Handle the SalesImport "updated" event.
     */
    public function updated(SalesImport $salesImport): void
    {
        // Trigger journaling only when status changes to Completed
        if ($salesImport->wasChanged('status') && $salesImport->status === SalesImportStatus::Completed) {
            $this->journalingService->recordSalesImport($salesImport);
        }
    }
}