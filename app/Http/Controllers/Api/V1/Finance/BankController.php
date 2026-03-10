<?php

namespace App\Http\Controllers\Api\V1\Finance;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBankRequest;
use App\Http\Requests\UpdateBankRequest;
use App\Models\Bank;
use App\Models\AuditLog;
use App\Support\ApiResponse;
use App\Traits\Auditable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class BankController extends Controller
{
    use ApiResponse, Auditable;

    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Bank::class);
        
        $query = Bank::query();

        if ($request->has('status')) {
            $query->where('status', $request->get('status'));
        }

        if ($request->has('bank_name')) {
            $query->byBank($request->get('bank_name'));
        }

        $banks = $query->paginate(15);

        return $this->success($banks);
    }

    public function store(StoreBankRequest $request): JsonResponse
    {
        Gate::authorize('create', Bank::class);
        
        $bank = Bank::create($request->validated());

        return $this->success($bank->load('account', 'manager'), 201);
    }

    public function show(Bank $bank): JsonResponse
    {
        Gate::authorize('view', $bank);
        
        return $this->success($bank->load('account', 'manager'));
    }

    public function update(UpdateBankRequest $request, Bank $bank): JsonResponse
    {
        Gate::authorize('update', $bank);
        
        $bank->update($request->validated());

        return $this->success($bank->load('account', 'manager'));
    }

    public function destroy(Bank $bank): JsonResponse
    {
        Gate::authorize('delete', $bank);
        
        // Log audit sebelum delete
        $this->logDelete(
            $bank,
            "Akun Bank/Kas #{$bank->id} ({$bank->bank_name}) dengan saldo akhir Rp " . number_format($bank->balance, 0, ',', '.') . " telah dihapus"
        );

        $bank->delete();

        return $this->success(null, 204);
    }
}
