<?php

namespace App\Observers;

use App\Models\RoyaltyCalculation;
use App\Enums\RoyaltyStatus;
use App\Services\Accounting\JournalingService;

class RoyaltyCalculationObserver
{
    public function __construct(protected JournalingService $journalingService)
    {
    }

    /**
     * Handle the RoyaltyCalculation "updated" event.
     */
    public function updated(RoyaltyCalculation $royaltyCalculation): void
    {
        // Trigger journaling only when status changes to Finalized
        if ($royaltyCalculation->wasChanged('status') && $royaltyCalculation->status === RoyaltyStatus::Finalized) {
            $this->journalingService->recordRoyaltyFinalization($royaltyCalculation);
        }
    }
}