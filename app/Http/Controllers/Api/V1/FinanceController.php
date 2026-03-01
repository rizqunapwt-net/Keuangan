<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Accounting\Account;
use App\Models\Accounting\Expense;
use App\Models\Accounting\Journal;
use App\Models\Accounting\JournalEntry;
use App\Models\Payment;
use App\Models\Sale;
use App\Models\Supplier;
use App\Models\PurchaseOrder;
use App\Domain\Finance\Services\ReportService;
use App\Domain\Inventory\Actions\CreatePurchaseAction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class FinanceController extends Controller
{
    protected \App\Domain\Finance\Services\AccountingService $accountingService;
    protected ReportService $reportService;

    public function __construct(
        \App\Domain\Finance\Services\AccountingService $accountingService,
        ReportService $reportService
    ) {
        $this->accountingService = $accountingService;
        $this->reportService = $reportService;
    }

    // ═══════ REPORTS ═══════

    public function profitAndLoss(Request $request): JsonResponse
    {
        $startDate = $request->input('start_date', now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->input('end_date', now()->endOfMonth()->format('Y-m-d'));

        $report = $this->reportService->getProfitAndLoss($startDate, $endDate);

        return response()->json([
            'success' => true,
            'data' => $report,
        ]);
    }

    public function balanceSheet(Request $request): JsonResponse
    {
        $asOfDate = $request->input('as_of', now()->format('Y-m-d'));
        $report = $this->reportService->getBalanceSheet($asOfDate);

        return response()->json([
            'success' => true,
            'data' => $report,
        ]);
    }

    public function cashFlow(Request $request): JsonResponse
    {
        $startDate = $request->input('start_date', now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->input('end_date', now()->endOfMonth()->format('Y-m-d'));

        $report = $this->reportService->getCashFlow($startDate, $endDate);

        return response()->json([
            'success' => true,
            'data' => $report,
        ]);
    }

    public function exportProfitLossPdf(Request $request)
    {
        $startDate = $request->input('start_date', now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->input('end_date', now()->endOfMonth()->format('Y-m-d'));

        $report = $this->reportService->getProfitAndLoss($startDate, $endDate);

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('reports.profit_loss_pdf', ['data' => $report]);
        
        return $pdf->download("laporan-laba-rugi-{$startDate}-{$endDate}.pdf");
    }

    // ═══════ EXPENSES ═══════

    public function expenses(Request $request): JsonResponse
    {
        $query = Expense::with(['account', 'payFromAccount'])
            ->latest('date');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $expenses = $query->get();

        $transformed = $expenses->map(fn ($e) => [
            'id' => $e->id,
            'refNumber' => $e->ref_number,
            'transDate' => $e->date->format('Y-m-d'),
            'status' => $e->status,
            'amount' => (float) $e->amount,
            'description' => $e->description,
        ]);

        return response()->json([
            'success' => true,
            'data' => $transformed,
        ]);
    }

    public function storeExpense(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'refNumber' => 'required|string|unique:accounting_expenses,ref_number',
            'transDate' => 'required|date',
            'accountId' => 'required|exists:accounting_accounts,id',
            'payFromAccountId' => 'required|exists:accounting_accounts,id',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'nullable|string|max:500',
        ]);

        try {
            $expense = $this->accountingService->recordExpense($validated, auth()->id());

            return response()->json([
                'success' => true,
                'message' => 'Biaya berhasil dicatat.',
                'data' => $expense,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function summary(): JsonResponse
    {
        $monthlySales = Sale::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->selectRaw('SUM(total_amount) as revenue')
            ->first();

        $monthlyExpenses = Expense::where('status', 'recorded')
            ->whereMonth('date', now()->month)
            ->whereYear('date', now()->year)
            ->sum('amount');

        return response()->json([
            'success' => true,
            'data' => [
                'monthly_revenue' => (float) ($monthlySales->revenue ?? 0),
                'monthly_expenses' => (float) $monthlyExpenses,
                'net_profit' => (float) (($monthlySales->revenue ?? 0) - $monthlyExpenses),
            ],
        ]);
    }

    public function purchases(Request $request): JsonResponse
    {
        $purchases = PurchaseOrder::with(['supplier', 'items.product'])
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $purchases,
        ]);
    }

    public function storePurchase(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_cost' => 'required|numeric|min:0',
            'total_amount' => 'required|numeric|min:0',
        ]);

        try {
            $action = app(CreatePurchaseAction::class);
            $purchase = $action->execute($validated);

            return response()->json([
                'success' => true,
                'message' => 'Pembelian stok berhasil dicatat.',
                'data' => $purchase,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    // ═══════ ACCOUNTING ═══════

    public function accounts(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => Account::where('is_active', true)->orderBy('code')->get(),
        ]);
    }

    public function journals(): JsonResponse
    {
        $journals = Journal::with('entries.account')
            ->latest('date')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $journals,
        ]);
    }

    public function invoices(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [],
        ]);
    }

    public function storeJournal(Request $request): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Not implemented yet.',
        ], 501);
    }

    public function reverseJournal(int $journalId): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Not implemented yet.',
        ], 501);
    }

    public function salesOrders(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [],
        ]);
    }

    public function contacts(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [],
        ]);
    }

    public function contactDetail(int $contactId): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Contact not found.',
        ], 404);
    }

    public function storeContact(Request $request): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Not implemented yet.',
        ], 501);
    }

    public function destroyContact(int $contactId): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Not implemented yet.',
        ], 501);
    }
}
