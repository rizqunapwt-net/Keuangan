<?php

namespace App\Domain\Contracts;

use App\Enums\ContractStatus;
use App\Models\Contract;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

class ContractService
{
    public function store(array $data, User $user): Contract
    {
        return Contract::create([
            'book_id' => $data['book_id'],
            'contract_file_path' => $data['contract_file_path'],
            'start_date' => $data['start_date'],
            'end_date' => $data['end_date'],
            'royalty_percentage' => $data['royalty_percentage'],
            'status' => ContractStatus::Pending,
            'created_by' => $user->id,
        ]);
    }

    public function approve(Contract $contract, User $user): Contract
    {
        if ($contract->status === ContractStatus::Approved) {
            return $contract;
        }

        if ($this->hasOverlappingApprovedContract($contract)) {
            throw new ConflictHttpException('Terdapat kontrak approved lain yang overlap untuk buku ini.');
        }

        $contract->update([
            'status' => ContractStatus::Approved,
            'approved_by' => $user->id,
            'approved_at' => now(),
            'rejected_reason' => null,
        ]);

        return $contract->refresh();
    }

    public function reject(Contract $contract, User $user, string $reason): Contract
    {
        $contract->update([
            'status' => ContractStatus::Rejected,
            'approved_by' => $user->id,
            'approved_at' => now(),
            'rejected_reason' => $reason,
        ]);

        return $contract->refresh();
    }

    public function expireApprovedContracts(?Carbon $referenceDate = null): int
    {
        $date = ($referenceDate ?? now())->startOfDay();

        return DB::transaction(function () use ($date): int {
            return Contract::query()
                ->where('status', ContractStatus::Approved)
                ->whereDate('end_date', '<', $date)
                ->update([
                    'status' => ContractStatus::Expired,
                    'updated_at' => now(),
                ]);
        });
    }

    private function hasOverlappingApprovedContract(Contract $contract): bool
    {
        return Contract::query()
            ->where('book_id', $contract->book_id)
            ->where('id', '!=', $contract->id)
            ->where('status', ContractStatus::Approved)
            ->whereDate('start_date', '<=', $contract->end_date)
            ->whereDate('end_date', '>=', $contract->start_date)
            ->exists();
    }
}
