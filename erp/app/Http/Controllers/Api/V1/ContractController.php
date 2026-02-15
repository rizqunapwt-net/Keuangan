<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Contracts\ContractService;
use App\Http\Controllers\Controller;
use App\Http\Requests\ApproveContractRequest;
use App\Http\Requests\RejectContractRequest;
use App\Http\Requests\StoreContractRequest;
use App\Models\Contract;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

class ContractController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly ContractService $contractService)
    {
    }

    public function store(StoreContractRequest $request): JsonResponse
    {
        $payload = $request->validated();

        $payload['contract_file_path'] = Storage::disk(config('filesystems.default'))
            ->putFile('contracts', $request->file('contract_file'));

        $contract = $this->contractService->store($payload, $request->user());

        return $this->success($contract->load('book'), 201);
    }

    public function approve(ApproveContractRequest $request, Contract $contract): JsonResponse
    {
        try {
            $contract = $this->contractService->approve($contract, $request->user());
        } catch (ConflictHttpException $exception) {
            return $this->error($exception->getMessage(), 409);
        }

        return $this->success($contract->load('book', 'approver'));
    }

    public function reject(RejectContractRequest $request, Contract $contract): JsonResponse
    {
        $contract = $this->contractService->reject($contract, $request->user(), $request->validated('rejected_reason'));

        return $this->success($contract->load('book', 'approver'));
    }
}
