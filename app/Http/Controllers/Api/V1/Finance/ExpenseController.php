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

    /**
     * List expenses — returns the format expected by the frontend.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Expense::latest('expense_date');

        if ($request->has('status')) {
            $query->where('status', $request->get('status'));
        }

        if ($request->has('account_id')) {
            $query->where('account_id', $request->get('account_id'));
        }

        if ($request->has('start_date') && $request->has('end_date')) {
            $query->byDateRange($request->get('start_date'), $request->get('end_date'));
        }

        $data = $query->get()->map(fn ($e) => [
            'id' => $e->id,
            'refNumber' => $e->reference_number ?? $e->expense_code,
            'transDate' => $e->expense_date?->format('Y-m-d'),
            'status' => $e->isVoided() ? 'void' : 'recorded',
            'amount' => (float) $e->amount,
            'description' => $e->description,
            'category' => $e->category,
        ]);

        return response()->json(['success' => true, 'data' => $data]);
    }

    /**
     * Store a new expense — handles the frontend form format.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'refNumber' => 'required|string',
            'transDate' => 'required|date',
            'accountId' => 'required|exists:accounting_accounts,id',
            'payFromAccountId' => 'required|exists:accounting_accounts,id',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'nullable|string|max:500',
        ]);

        try {
            // Find the bank that is linked to the payFromAccountId
            $bank = \App\Models\Bank::where('account_id', $validated['payFromAccountId'])->first();

            $expense = Expense::create([
                'expense_date' => $validated['transDate'],
                'reference_number' => $validated['refNumber'],
                'account_id' => $validated['accountId'],
                'bank_id' => $bank?->id,
                'amount' => $validated['amount'],
                'description' => $validated['description'],
                'payment_method' => $bank ? $bank->bank_name : 'Cash',
                'category' => 'Operasional',
                'status' => \App\Enums\ExpenseStatus::APPROVED,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Biaya berhasil dicatat.',
                'data' => $expense,
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
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
