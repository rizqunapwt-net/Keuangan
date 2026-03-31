<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Finance\Services\AccountingService;
use App\Domain\Finance\Services\ReportService;
use App\Http\Controllers\Controller;
use App\Models\Accounting\Account;
use App\Services\Finance\ReportExportService;
use App\Traits\LogsActivity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class FinanceController extends Controller
{
    use LogsActivity;

    public function __construct(
        protected AccountingService $accountingService,
        protected ReportService $reportService,
        protected ReportExportService $exportService,
    ) {}

    // ═══════ REPORTS ═══════

    public function profitAndLoss(Request $request): JsonResponse
    {
        Gate::authorize('finance.view_reports');
        ['start_date' => $start, 'end_date' => $end] = $this->exportService->getDateRange($request);
        $report = $this->reportService->getProfitAndLoss($start, $end);

        return response()->json(['success' => true, 'data' => $report]);
    }

    public function balanceSheet(Request $request): JsonResponse
    {
        Gate::authorize('finance.view_reports');
        $asOf = $request->input('as_of', now()->format('Y-m-d'));
        $report = $this->reportService->getBalanceSheet($asOf);

        return response()->json(['success' => true, 'data' => $report]);
    }

    public function cashFlow(Request $request): JsonResponse
    {
        Gate::authorize('finance.view_reports');
        ['start_date' => $start, 'end_date' => $end] = $this->exportService->getDateRange($request);
        $report = $this->reportService->getCashFlow($start, $end);

        return response()->json(['success' => true, 'data' => $report]);
    }

    public function summary(): JsonResponse
    {
        Gate::authorize('finance.view_reports');

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
        Gate::authorize('finance.view_reports');

        ['start_date' => $start, 'end_date' => $end] = $this->exportService->getDateRange($request);

        return $this->exportService->exportProfitLossPdf($start, $end);
    }

    public function exportProfitLossExcel(Request $request)
    {
        Gate::authorize('finance.view_reports');

        ['start_date' => $start, 'end_date' => $end] = $this->exportService->getDateRange($request);

        return $this->exportService->exportProfitLossExcel($start, $end);
    }

    public function exportBalanceSheetPdf(Request $request)
    {
        Gate::authorize('finance.view_reports');

        $asOf = $request->input('as_of', now()->format('Y-m-d'));

        return $this->exportService->exportBalanceSheetPdf($asOf);
    }

    public function exportBalanceSheetExcel(Request $request)
    {
        Gate::authorize('finance.view_reports');

        $asOf = $request->input('as_of', now()->format('Y-m-d'));

        return $this->exportService->exportBalanceSheetExcel($asOf);
    }

    public function exportCashFlowPdf(Request $request)
    {
        Gate::authorize('finance.view_reports');

        ['start_date' => $start, 'end_date' => $end] = $this->exportService->getDateRange($request);

        return $this->exportService->exportCashFlowPdf($start, $end);
    }

    public function exportCashFlowExcel(Request $request)
    {
        Gate::authorize('finance.view_reports');

        ['start_date' => $start, 'end_date' => $end] = $this->exportService->getDateRange($request);

        return $this->exportService->exportCashFlowExcel($start, $end);
    }

    // ═══════ ACCOUNTING ═══════

    public function accounts(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => Account::where('is_active', true)->orderBy('code')->get(),
        ]);
    }
}
