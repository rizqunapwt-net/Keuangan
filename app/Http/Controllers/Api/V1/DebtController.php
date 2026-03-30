<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Bank;
use App\Models\CashTransaction;
use App\Models\Debt;
use App\Models\DebtPayment;
use App\Traits\Auditable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;
use RuntimeException;

class DebtController extends Controller
{
    use Auditable;

    public function index(Request $request)
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

        return response()->json($query->orderBy('date', 'desc')->get());
    }

    public function store(Request $request)
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

            return response()->json($debt, 201);
        });
    }

    public function show(Debt $debt)
    {
        Gate::authorize('view', $debt);

        return $debt->load('payments');
    }

    public function update(Request $request, Debt $debt)
    {
        Gate::authorize('update', $debt);

        $validated = $request->validate([
            'date' => 'required|date',
            'due_date' => 'nullable|date',
            'client_name' => 'required|string',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'nullable|string',
        ]);

        $debt->update($validated);
        $debt->updateStatus();

        return response()->json($debt);
    }

    public function destroy(Debt $debt)
    {
        Gate::authorize('delete', $debt);

        return DB::transaction(function () use ($debt) {
            $paymentSnapshots = $debt->payments()->get();

            // For audit safety, deleting a debt doesn't reverse previous cash transactions automatically
            // as those should be deleted manually in the ledger for better trace-ability.
            if (! $debt->delete()) {
                throw new RuntimeException("Gagal menghapus hutang/piutang #{$debt->id}.");
            }

            foreach ($paymentSnapshots as $payment) {
                $this->logDelete(
                    $payment,
                    "Pembayaran #{$payment->id} sebesar Rp ".number_format((float) $payment->amount, 0, ',', '.')." (debt #{$debt->id}) ikut terhapus karena cascade delete."
                );
            }

            $this->logDelete(
                $debt,
                "Hutang/Piutang #{$debt->id} ({$debt->client_name}) sebesar Rp ".number_format((float) $debt->amount, 0, ',', '.').' telah dihapus.'
            );

            return response()->json(null, 204);
        });
    }

    public function storePayment(Request $request, Debt $debt)
    {
        Gate::authorize('recordPayment', $debt);

        $validated = $request->validate([
            'date' => 'required|date',
            'bank_id' => 'required|exists:banks,id',
            'amount' => 'required|numeric|min:0.01',
            'note' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated, $debt) {
            // Prevent over-payment
            $remainingDebt = (float) $debt->amount - (float) $debt->paid_amount;
            if ((float) $validated['amount'] > $remainingDebt) {
                throw ValidationException::withMessages([
                    'amount' => ['Jumlah pembayaran melebihi sisa hutang/piutang. Sisa: Rp '.number_format($remainingDebt, 0, ',', '.').', Anda membayar: Rp '.number_format($validated['amount'], 0, ',', '.')],
                ]);
            }

            // Logic specifically moved to DebtPayment model observer for consistency
            $payment = $debt->payments()->create($validated);

            return response()->json($payment, 201);
        });
    }

    public function destroyPayment(DebtPayment $payment)
    {
        return DB::transaction(function () use ($payment) {
            $debt = $payment->debt;
            if (! $debt) {
                throw new RuntimeException("Data debt untuk pembayaran #{$payment->id} tidak ditemukan.");
            }

            $bank = Bank::lockForUpdate()->find($payment->bank_id);
            $paymentAmount = (float) $payment->amount;

            // Reverse balance if bank existed
            if ($bank) {
                $oldBalance = (float) $bank->balance;
                $isIncome = $debt->type === 'receivable'; // Original (+Cash) -> Reverse (-Cash)
                if ($isIncome) {
                    $bank->balance -= $paymentAmount;
                } else {
                    $bank->balance += $paymentAmount;
                }
                $newBalance = (float) $bank->balance;
                $bank->save();

                // Log audit untuk perubahan saldo
                $this->logBalanceChange(
                    $bank,
                    $oldBalance,
                    $newBalance,
                    "Saldo {$bank->bank_name} berubah akibat penghapusan pembayaran hutang/piutang #{$payment->id}"
                );
            }

            if (! $payment->delete()) {
                throw new RuntimeException("Gagal menghapus pembayaran hutang/piutang #{$payment->id}.");
            }

            // Log audit untuk delete payment
            $this->logDelete(
                $payment,
                "Pembayaran #{$payment->id} sebesar Rp ".number_format($paymentAmount, 0, ',', '.')." untuk {$debt->client_name} telah dihapus."
            );

            $debt->updateStatus();

            return response()->json(null, 204);
        });
    }
}
