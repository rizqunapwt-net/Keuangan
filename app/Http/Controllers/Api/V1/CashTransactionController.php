<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\CashTransaction;
use App\Models\Bank;
use App\Models\AuditLog;
use App\Traits\Auditable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class CashTransactionController extends Controller
{
    use Auditable;
    public function index(Request $request)
    {
        $query = CashTransaction::with('bank');

        if ($request->has('type')) {
            $query->where('type', '=', $request->type);
        }

        if ($request->has('bank_id')) {
            $query->where('bank_id', '=', $request->bank_id);
        }

        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('date', [$request->start_date, $request->end_date]);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%");
            });
        }

        return response()->json($query->orderBy('date', 'desc')->orderBy('created_at', 'desc')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:income,expense',
            'bank_id' => 'required|exists:banks,id',
            'date' => 'required|date',
            'time' => 'nullable',
            'amount' => 'required|numeric|min:0.01',
            'category' => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated) {
            $bank = Bank::lockForUpdate()->find($validated['bank_id']);

            // Prevent negative balance
            if ($validated['type'] === 'expense') {
                $newBalance = (float) $bank->balance - (float) $validated['amount'];
                if ($newBalance < 0) {
                    throw ValidationException::withMessages([
                        'amount' => ['Saldo bank tidak cukup. Saldo saat ini: Rp ' . number_format($bank->balance, 0, ',', '.') . ', Anda mencoba mengurangi Rp ' . number_format($validated['amount'], 0, ',', '.')],
                    ]);
                }
                $bank->balance = $newBalance;
            } else {
                $bank->balance += $validated['amount'];
            }
            $bank->save();

            $validated['running_balance'] = $bank->balance;
            $transaction = CashTransaction::create($validated);

            return response()->json($transaction, 201);
        });
    }

    public function summary()
    {
        $totalIncome = CashTransaction::where('type', 'income')->sum('amount');
        $totalExpense = CashTransaction::where('type', 'expense')->sum('amount');
        $netBalance = Bank::sum('balance');

        return response()->json([
            'total_income' => $totalIncome,
            'total_expense' => $totalExpense,
            'net_balance' => $netBalance,
        ]);
    }

    public function destroy(CashTransaction $cashTransaction)
    {
        return DB::transaction(function () use ($cashTransaction) {
            $bank = Bank::lockForUpdate()->find($cashTransaction->bank_id);
            $oldBalance = $bank->balance;

            // Batalkan efek pada saldo bank
            if ($cashTransaction->type === 'income') {
                $bank->balance -= $cashTransaction->amount;
            } else {
                $bank->balance += $cashTransaction->amount;
            }
            $newBalance = $bank->balance;
            $bank->save();

            // Log audit untuk perubahan saldo
            $this->logBalanceChange(
                $bank,
                $oldBalance,
                $newBalance,
                "Saldo {$bank->name} berubah akibat penghapusan transaksi kas #{$cashTransaction->id}"
            );

            // Log audit untuk delete transaksi
            $this->logDelete(
                $cashTransaction,
                "Transaksi kas #{$cashTransaction->id} ({$cashTransaction->type}) sebesar Rp " . number_format($cashTransaction->amount, 0, ',', '.') . " telah dihapus"
            );

            $cashTransaction->delete();
            return response()->json(null, 204);
        });
    }
}
