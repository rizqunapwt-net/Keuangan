<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Finance\Services\AccountingService;
use App\Domain\Finance\Services\ReportService;
use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\StoreExpenseRequest;
use App\Http\Requests\Finance\StoreJournalRequest;
use App\Models\Accounting\Account;
use App\Models\Accounting\Journal;
use App\Models\Contact;
use App\Models\Debt;
use App\Models\Expense;
use App\Services\Finance\ReportExportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FinanceController extends Controller
{
    public function __construct(
        protected AccountingService $accountingService,
        protected ReportService $reportService,
        protected ReportExportService $exportService,
    ) {}

    // ═══════ REPORTS ═══════

    public function profitAndLoss(Request $request): JsonResponse
    {
        ['start_date' => $start, 'end_date' => $end] = $this->exportService->getDateRange($request);
        $report = $this->reportService->getProfitAndLoss($start, $end);
        return response()->json(['success' => true, 'data' => $report]);
    }

    public function balanceSheet(Request $request): JsonResponse
    {
        $asOf = $request->input('as_of', now()->format('Y-m-d'));
        $report = $this->reportService->getBalanceSheet($asOf);
        return response()->json(['success' => true, 'data' => $report]);
    }

    public function cashFlow(Request $request): JsonResponse
    {
        ['start_date' => $start, 'end_date' => $end] = $this->exportService->getDateRange($request);
        $report = $this->reportService->getCashFlow($start, $end);
        return response()->json(['success' => true, 'data' => $report]);
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

    // ═══════ EXPORTS ═══════

    public function exportProfitLossPdf(Request $request)
    {
        ['start_date' => $start, 'end_date' => $end] = $this->exportService->getDateRange($request);
        return $this->exportService->exportProfitLossPdf($start, $end);
    }

    public function exportProfitLossExcel(Request $request)
    {
        ['start_date' => $start, 'end_date' => $end] = $this->exportService->getDateRange($request);
        return $this->exportService->exportProfitLossExcel($start, $end);
    }

    public function exportBalanceSheetPdf(Request $request)
    {
        $asOf = $request->input('as_of', now()->format('Y-m-d'));
        return $this->exportService->exportBalanceSheetPdf($asOf);
    }

    public function exportBalanceSheetExcel(Request $request)
    {
        $asOf = $request->input('as_of', now()->format('Y-m-d'));
        return $this->exportService->exportBalanceSheetExcel($asOf);
    }

    public function exportCashFlowPdf(Request $request)
    {
        ['start_date' => $start, 'end_date' => $end] = $this->exportService->getDateRange($request);
        return $this->exportService->exportCashFlowPdf($start, $end);
    }

    public function exportCashFlowExcel(Request $request)
    {
        ['start_date' =>  $start, 'end_date' => $end] = $this->exportService->getDateRange($request);
        return $this->exportService->exportCashFlowExcel($start, $end);
    }

    // ═══════ EXPENSES ═══════

    public function expenses(Request $request): JsonResponse
    {
        $query = Expense::latest('expense_date');
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $data = $query->get()->map(fn ($e) => [
            'id' => $e->id,
            'refNumber' => $e->expense_code,
            'transDate' => $e->expense_date?->format('Y-m-d'),
            'status' => $e->status,
            'amount' => (float) $e->amount,
            'description' => $e->description,
        ]);

        return response()->json(['success' => true, 'data' => $data]);
    }

    public function storeExpense(StoreExpenseRequest $request): JsonResponse
    {
        try {
            $expense = $this->accountingService->recordExpense($request->validated(), auth()->id());
            return response()->json([
                'success' => true,
                'message' => 'Biaya berhasil dicatat.',
                'data' => $expense,
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
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
        $query = Debt::where('type', 'receivable')
            ->latest('date');

        if ($request->filled('search')) {
            $search = $request->string('search')->toString();
            $query->where(function ($sub) use ($search) {
                $sub->where('client_name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $invoices = $query->get()->map(function ($d) {
            $total = (float) $d->amount;
            $paid = (float) $d->paid_amount;
            $invNumber = $d->kodeinvoice ?: ('INV-' . str_pad($d->id, 6, '0', STR_PAD_LEFT));
            $items = $d->items ? (is_string($d->items) ? json_decode($d->items, true) : $d->items) : [];
            return [
                'id' => $d->id,
                'type' => 'sales',
                'invoice_number' => $invNumber,
                'refNumber' => $invNumber,
                'number' => $invNumber,
                'kodeinvoice' => $d->kodeinvoice,
                'total_amount' => $total,
                'total' => $total,
                'paid_amount' => $paid,
                'paidAmount' => $paid,
                'remaining_balance' => $total - $paid,
                'status' => $d->status,
                'transDate' => $d->date?->toISOString(),
                'date' => $d->date?->toDateString(),
                'due_date' => $d->due_date?->toDateString(),
                'dueDate' => $d->due_date?->toDateString(),
                'customer_name' => $d->client_name ?? '-',
                'contactName' => $d->client_name ?? '-',
                'contact' => [
                    'name' => $d->client_name ?? '-'
                ],
                'description' => $d->description,
                'items' => $items,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $invoices,
        ]);
    }

    public function storeInvoice(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'contactId' => 'nullable|exists:contacts,id',
            'client_name' => 'nullable|string|max:255',
            'transDate' => 'required|date',
            'dueDate' => 'nullable|date',
            'description' => 'nullable|string|max:500',
            'items' => 'required|array|min:1',
            'items.*.nama_produk' => 'required|string|max:255',
            'items.*.jumlah' => 'required|numeric|min:1',
            'items.*.satuan' => 'required|string|max:50',
            'items.*.harga' => 'required|numeric|min:0',
            'items.*.diskon' => 'nullable|numeric|min:0',
        ]);

        $clientName = $validated['client_name'] ?? null;
        if (!empty($validated['contactId'])) {
            $contact = Contact::find($validated['contactId']);
            $clientName = $contact->name;
        }

        $items = collect($validated['items'])->map(fn($item) => [
            'nama_produk' => $item['nama_produk'],
            'jumlah' => (int) $item['jumlah'],
            'satuan' => $item['satuan'],
            'harga' => (float) $item['harga'],
            'diskon' => (float) ($item['diskon'] ?? 0),
        ])->toArray();

        $total = collect($items)->sum(fn($i) => ($i['harga'] * $i['jumlah']) - $i['diskon']);

        $debt = Debt::create([
            'type' => 'receivable',
            'status' => 'unpaid',
            'date' => $validated['transDate'],
            'due_date' => $validated['dueDate'] ?? null,
            'client_name' => $clientName ?? 'Umum',
            'description' => $validated['description'] ?? null,
            'amount' => $total,
            'paid_amount' => 0,
            'items' => $items,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Invoice berhasil dibuat.',
            'data' => [
                'id' => $debt->id,
                'refNumber' => 'INV-' . str_pad($debt->id, 6, '0', STR_PAD_LEFT),
            ],
        ], 201);
    }

    public function updateInvoice(Request $request, int $id): JsonResponse
    {
        $debt = Debt::where('type', 'receivable')->findOrFail($id);

        $validated = $request->validate([
            'client_name' => 'nullable|string|max:255',
            'transDate' => 'nullable|date',
            'dueDate' => 'nullable|date',
            'description' => 'nullable|string|max:500',
            'items' => 'nullable|array|min:1',
            'items.*.nama_produk' => 'required|string|max:255',
            'items.*.jumlah' => 'required|numeric|min:1',
            'items.*.satuan' => 'required|string|max:50',
            'items.*.harga' => 'required|numeric|min:0',
            'items.*.diskon' => 'nullable|numeric|min:0',
        ]);

        if (isset($validated['client_name'])) {
            $debt->client_name = $validated['client_name'];
        }
        if (isset($validated['transDate'])) {
            $debt->date = $validated['transDate'];
        }
        if (isset($validated['dueDate'])) {
            $debt->due_date = $validated['dueDate'];
        }
        if (isset($validated['description'])) {
            $debt->description = $validated['description'];
        }

        if (isset($validated['items'])) {
            $items = collect($validated['items'])->map(fn($item) => [
                'nama_produk' => $item['nama_produk'],
                'jumlah' => (int) $item['jumlah'],
                'satuan' => $item['satuan'],
                'harga' => (float) $item['harga'],
                'diskon' => (float) ($item['diskon'] ?? 0),
            ])->toArray();

            $debt->items = $items;
            $debt->amount = collect($items)->sum(fn($i) => ($i['harga'] * $i['jumlah']) - $i['diskon']);
        }

        $debt->save();

        return response()->json([
            'success' => true,
            'message' => 'Invoice berhasil diperbarui.',
        ]);
    }

    public function deleteInvoice(int $id): JsonResponse
    {
        $debt = Debt::where('type', 'receivable')->findOrFail($id);

        if ($debt->status === 'paid') {
            return response()->json([
                'success' => false,
                'message' => 'Tidak bisa menghapus invoice yang sudah lunas.',
            ], 422);
        }

        $debt->payments()->delete();
        $debt->delete();

        return response()->json([
            'success' => true,
            'message' => 'Invoice berhasil dihapus.',
        ]);
    }

    public function togglePaidStatus(int $id): JsonResponse
    {
        $debt = Debt::where('type', 'receivable')->findOrFail($id);

        if ($debt->status === 'paid') {
            $debt->status = 'unpaid';
            $debt->paid_amount = 0;
        } else {
            $debt->status = 'paid';
            $debt->paid_amount = $debt->amount;
        }

        $debt->save();

        return response()->json([
            'success' => true,
            'message' => $debt->status === 'paid' ? 'Invoice ditandai LUNAS.' : 'Invoice ditandai BELUM LUNAS.',
            'data' => ['status' => $debt->status],
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
