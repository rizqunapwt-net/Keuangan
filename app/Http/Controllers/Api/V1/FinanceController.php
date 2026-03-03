<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Finance\Services\AccountingService;
use App\Domain\Finance\Services\ReportService;
use App\Http\Controllers\Controller;
use App\Models\Accounting\Account;
use App\Models\Accounting\Expense;
use App\Models\Accounting\Journal;
use App\Models\Contact;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FinanceController extends Controller
{
    protected AccountingService $accountingService;

    protected ReportService $reportService;

    public function __construct(
        AccountingService $accountingService,
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

    public function exportProfitLossExcel(Request $request)
    {
        $startDate = $request->input('start_date', now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->input('end_date', now()->endOfMonth()->format('Y-m-d'));

        $report = $this->reportService->getProfitAndLoss($startDate, $endDate);

        return \Maatwebsite\Excel\Facades\Excel::download(
            new \App\Exports\ProfitLossExport($report, $startDate, $endDate),
            "laba-rugi-{$startDate}-{$endDate}.xlsx"
        );
    }

    public function exportBalanceSheetExcel(Request $request)
    {
        $asOfDate = $request->input('as_of', now()->format('Y-m-d'));

        $report = $this->reportService->getBalanceSheet($asOfDate);

        return \Maatwebsite\Excel\Facades\Excel::download(
            new \App\Exports\BalanceSheetExport($report, $asOfDate),
            "neraca-{$asOfDate}.xlsx"
        );
    }

    public function exportCashFlowPdf(Request $request)
    {
        $startDate = $request->input('start_date', now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->input('end_date', now()->endOfMonth()->format('Y-m-d'));

        $report = $this->reportService->getCashFlow($startDate, $endDate);

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('reports.cash_flow_pdf', [
            'data' => $report,
            'start' => $startDate,
            'end' => $endDate,
        ]);

        return $pdf->download("laporan-arus-kas-{$startDate}-{$endDate}.pdf");
    }

    public function exportCashFlowExcel(Request $request)
    {
        $startDate = $request->input('start_date', now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->input('end_date', now()->endOfMonth()->format('Y-m-d'));

        $report = $this->reportService->getCashFlow($startDate, $endDate);

        return \Maatwebsite\Excel\Facades\Excel::download(
            new \App\Exports\CashFlowExport($report, $startDate, $endDate),
            "arus-kas-{$startDate}-{$endDate}.xlsx"
        );
    }

    public function exportBalanceSheetPdf(Request $request)
    {
        $asOfDate = $request->input('as_of', now()->format('Y-m-d'));

        $report = $this->reportService->getBalanceSheet($asOfDate);

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('reports.balance_sheet_pdf', [
            'data' => $report,
            'asOf' => $asOfDate,
        ]);

        return $pdf->download("neraca-{$asOfDate}.pdf");
    }

    // ═══════ EXPENSES ═══════

    public function expenses(Request $request): JsonResponse
    {
        $expenses = Expense::with(['account', 'payFromAccount'])
            ->latest('date')
            ->when($request->filled('status'), function ($q) use ($request) {
                return $q->where('status', '=', (string)$request->status);
            })
            ->get();

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
        $start = now()->startOfMonth()->toDateString();
        $end = now()->endOfMonth()->toDateString();

        $pl = $this->reportService->getProfitAndLoss($start, $end);

        return response()->json([
            'success' => true,
            'data' => [
                'monthly_revenue' => (float) $pl['revenues']['total'],
                'monthly_expenses' => (float) $pl['expenses']['total'],
                'net_profit' => (float) $pl['net_profit'],
            ],
        ]);
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
        $journals = Journal::with(['entries.account', 'user'])
            ->latest('date')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $journals,
        ]);
    }

    public function invoices(Request $request): JsonResponse
    {
        $query = Payment::with([
            'calculation.author:id,name',
            'user:id,name',
        ])->latest();

        if ($request->filled('search')) {
            $search = $request->string('search')->toString();
            $query->where(function ($sub) use ($search) {
                $sub->where('invoice_number', 'like', "%{$search}%")
                    ->orWhere('payment_reference', 'like', "%{$search}%");
            });
        }

        $payments = $query->get()->map(function ($p) {
            $status = $p->status instanceof \BackedEnum
                ? $p->status->value
                : strtolower((string) $p->status);

            return [
                'id' => $p->id,
                'type' => 'royalty',
                'refNumber' => $p->invoice_number,
                'number' => $p->invoice_number,
                'total' => (float) $p->amount,
                'paidAmount' => $status === 'paid' ? (float) $p->amount : 0,
                'status' => $status,
                'transDate' => $p->created_at->toISOString(),
                'date' => $p->created_at->toDateString(),
                'contactName' => $p->calculation?->author?->name ?? $p->user?->name ?? 'Author',
                'contact' => ['name' => $p->calculation?->author?->name ?? $p->user?->name ?? 'Author'],
                'ref' => $p->payment_reference,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $payments,
        ]);
    }

    public function storeJournal(Request $request, AccountingService $accounting): JsonResponse
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'description' => 'required|string|max:500',
            'reference' => 'nullable|string|max:100',
            'items' => 'required|array|min:2',
            'items.*.account_id' => 'required|exists:accounting_accounts,id',
            'items.*.type' => 'required|in:debit,credit',
            'items.*.amount' => 'required|numeric|min:0',
        ]);

        $debitTotal = collect($request->items)->filter(fn ($i) => $i['type'] === 'debit')->sum('amount');
        $creditTotal = collect($request->items)->filter(fn ($i) => $i['type'] === 'credit')->sum('amount');

        if ($debitTotal != $creditTotal) {
            return response()->json([
                'success' => false,
                'message' => 'Total Debit dan Credit tidak seimbang.',
            ], 422);
        }

        try {
            $journal = $accounting->recordJournal($validated, auth()->id());

            return response()->json([
                'success' => true,
                'message' => 'Jurnal berhasil dicatat.',
                'data' => $journal,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mencatat jurnal: '.$e->getMessage(),
            ], 500);
        }
    }

    public function reverseJournal(int $journalId, AccountingService $accounting): JsonResponse
    {
        $journal = Journal::findOrFail($journalId);

        try {
            $reversed = $accounting->reverseJournal($journal, auth()->id());

            return response()->json([
                'success' => true,
                'message' => 'Jurnal berhasil dibalik.',
                'data' => $reversed,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal membalik jurnal: '.$e->getMessage(),
            ], 500);
        }
    }

    public function contacts(Request $request): JsonResponse
    {
        $query = Contact::latest();

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                    ->orWhere('company_name', 'like', "%{$request->search}%")
                    ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        return response()->json([
            'success' => true,
            'data' => $query->get(),
        ]);
    }

    public function contactDetail(int $contactId): JsonResponse
    {
        $contact = Contact::find($contactId);

        if (! $contact) {
            return response()->json([
                'success' => false,
                'message' => 'Kontak tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $contact,
        ]);
    }

    public function storeContact(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'type' => 'required|in:customer,vendor,both',
            'tax_number' => 'nullable|string|max:50',
            'notes' => 'nullable|string',
        ]);

        $validated['created_by'] = auth()->id();

        $contact = Contact::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Kontak berhasil dibuat.',
            'data' => $contact,
        ], 201);
    }

    public function destroyContact(int $contactId): JsonResponse
    {
        $contact = Contact::find($contactId);

        if (! $contact) {
            return response()->json([
                'success' => false,
                'message' => 'Kontak tidak ditemukan.',
            ], 404);
        }

        $contact->delete();

        return response()->json([
            'success' => true,
            'message' => 'Kontak berhasil dihapus.',
        ]);
    }
}
