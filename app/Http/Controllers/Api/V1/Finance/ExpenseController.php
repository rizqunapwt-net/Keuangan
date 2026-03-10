<?php

namespace App\Http\Controllers\Api\V1\Finance;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreExpenseRequest;
use App\Http\Requests\UpdateExpenseRequest;
use App\Models\Expense;
use App\Models\AuditLog;
use App\Support\ApiResponse;
use App\Traits\Auditable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ExpenseController extends Controller
{
    use ApiResponse, Auditable;

    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Expense::class);
        
        $query = Expense::query();

        if ($request->has('status')) {
            $query->where('status', $request->get('status'));
        }

        if ($request->has('account_id')) {
            $query->where('account_id', $request->get('account_id'));
        }

        if ($request->has('start_date') && $request->has('end_date')) {
            $query->byDateRange($request->get('start_date'), $request->get('end_date'));
        }

        $expenses = $query->paginate(15);

        return $this->success($expenses);
    }

    public function store(StoreExpenseRequest $request): JsonResponse
    {
        Gate::authorize('create', Expense::class);
        
        $data = $request->validated();

        if ($request->hasFile('attachment_path')) {
            $data['attachment_path'] = $request->file('attachment_path')->store('expenses', 'public');
        }

        $expense = Expense::create($data);

        return $this->success($expense->load('account', 'creator'), 201);
    }

    public function show(Expense $expense): JsonResponse
    {
        Gate::authorize('view', $expense);
        
        return $this->success($expense->load('account', 'creator', 'approver', 'voidedBy'));
    }

    public function update(UpdateExpenseRequest $request, Expense $expense): JsonResponse
    {
        Gate::authorize('update', $expense);
        
        $data = $request->validated();
        if ($request->hasFile('attachment_path')) {
            $data['attachment_path'] = $request->file('attachment_path')->store('expenses', 'public');
        }

        $expense->update($data);

        return $this->success($expense->load('account', 'creator'));
    }

    public function void(Request $request, Expense $expense): JsonResponse
    {
        Gate::authorize('void', $expense);
        
        $request->validate([
            'void_reason' => 'required|string|max:500',
        ]);

        // Simpan old values untuk audit
        $oldValues = $expense->toArray();

        $expense->void(auth()->id(), $request->get('void_reason'));

        // Log audit untuk void
        $this->logVoid(
            $expense,
            $request->get('void_reason'),
            $oldValues
        );

        return $this->success($expense->load('voidedBy'), 200);
    }

    public function destroy(Expense $expense): JsonResponse
    {
        Gate::authorize('delete', $expense);
        
        // Log audit sebelum delete
        $this->logDelete(
            $expense,
            "Biaya #{$expense->id} ({$expense->description}) sebesar Rp " . number_format($expense->amount, 0, ',', '.') . " telah dihapus"
        );

        $expense->delete();

        return $this->success(null, 204);
    }
}
