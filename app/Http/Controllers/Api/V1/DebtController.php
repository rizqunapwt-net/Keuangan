<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Bank;
use App\Models\CashTransaction;
use App\Models\Debt;
use App\Models\DebtPayment;
use App\Support\ApiResponse;
use App\Traits\Auditable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;
use RuntimeException;

class DebtController extends Controller
{
    use ApiResponse, Auditable;

    public function index(Request $request): JsonResponse
    {
        Gate::authorize('viewAny', Debt::class);

        $query = Debt::query();

        if ($request->has('type')) {
            $query->where('type', '=', $request->type);
        }

        if ($request->has('status')) {
            $query->where('status', '=', $request->status);
        }

        if ($request->has('contact_id')) {
            $query->where('contact_id', '=', $request->contact_id);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('client_name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        return $this->success($query->orderBy('date', 'desc')->get());
    }

    public function store(Request $request): JsonResponse
    {
        Gate::authorize('create', Debt::class);

        $validated = $request->validate([
            'type' => 'required|in:payable,receivable',
            'date' => 'required|date',
            'due_date' => 'nullable|date',
            'client_name' => 'required|string|max:255',
            'bank_id' => 'nullable|exists:banks,id',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated) {
            $debt = Debt::create($validated);

            // Record initial cash flow if bank provided
            if ($debt->bank_id) {
                $bank = Bank::lockForUpdate()->find($debt->bank_id);
                if (! $bank) {
                    throw ValidationException::withMessages([
                        'bank_id' => ['Bank tidak ditemukan atau sudah dihapus.'],
                    ]);
                }

                $isIncome = $debt->type === 'payable'; // Borrowing = +Cash

                if ($isIncome) {
                    $bank->balance += $debt->amount;
                } else {
                    $bank->balance -= $debt->amount;
                }
                $bank->save();

                CashTransaction::create([
                    'type' => $isIncome ? 'income' : 'expense',
                    'bank_id' => $debt->bank_id,
                    'date' => $debt->date,
                    'amount' => $debt->amount,
                    'category' => 'Hutang/Piutang',
                    'description' => ($isIncome ? 'Terima Pinjaman' : 'Berikan Piutang').' dari '.$debt->client_name,
                    'running_balance' => $bank->balance,
                ]);
            }

            return $this->success($debt, 201);
        });
    }

    public function show(Debt $debt): JsonResponse
    {
        Gate::authorize('view', $debt);

        return $this->success($debt->load('payments'));
    }

    public function update(Request $request, Debt $debt): JsonResponse
    {
        Gate::authorize('update', $debt);

        $validated = $request->validate([
            'date' => 'required|date',
            'due_date' => 'nullable|date',
            'client_name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $debt->update($validated);

        return $this->success($debt);
    }

    public function destroy(Debt $debt): JsonResponse
    {
        Gate::authorize('delete', $debt);

        return DB::transaction(function () use ($debt) {
            // Delete associated payments first
            $debt->payments()->delete();

            // Log before delete
            $this->logDelete($debt, "Menghapus data ".($debt->type === 'payable' ? 'Hutang' : 'Piutang')." dari {$debt->client_name} sebesar {$debt->amount}");

            $debt->delete();

            return $this->success(null, 204);
        });
    }

    public function storePayment(Request $request, Debt $debt): JsonResponse
    {
        Gate::authorize('recordPayment', $debt);

        $validated = $request->validate([
            'date' => 'required|date',
            'amount' => 'required|numeric|min:0.01',
            'bank_id' => 'required|exists:banks,id',
            'description' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated, $debt) {
            $payment = $debt->payments()->create($validated);

            $bank = Bank::lockForUpdate()->find($validated['bank_id']);
            $isIncome = $debt->type === 'receivable'; // Collecting receivable = +Cash

            if ($isIncome) {
                $bank->balance += $validated['amount'];
            } else {
                $bank->balance -= $validated['amount'];
            }
            $bank->save();

            CashTransaction::create([
                'type' => $isIncome ? 'income' : 'expense',
                'bank_id' => $validated['bank_id'],
                'date' => $validated['date'],
                'amount' => $validated['amount'],
                'category' => 'Hutang/Piutang',
                'description' => 'Pembayaran '.($debt->type === 'payable' ? 'Hutang' : 'Piutang').' ke '.$debt->client_name,
                'running_balance' => $bank->balance,
            ]);

            // Update debt status if fully paid
            $totalPaid = $debt->payments()->sum('amount');
            if ($totalPaid >= $debt->amount) {
                $debt->status = 'paid';
                $debt->save();
            }

            return $this->success($payment, 201);
        });
    }

    public function destroyPayment(DebtPayment $payment): JsonResponse
    {
        // For simplicity, only admin can delete payments
        Gate::authorize('delete', Debt::class);

        return DB::transaction(function () use ($payment) {
            $debt = $payment->debt;
            $bank = Bank::lockForUpdate()->find($payment->bank_id);

            $isIncome = $debt->type === 'receivable';

            // Reverse balance
            if ($isIncome) {
                $bank->balance -= $payment->amount;
            } else {
                $bank->balance += $payment->amount;
            }
            $bank->save();

            // Revert debt status if it was paid
            if ($debt->status === 'paid') {
                $debt->status = 'partial';
                $debt->save();
            }

            $payment->delete();

            return $this->success(null, 204);
        });
    }
}
