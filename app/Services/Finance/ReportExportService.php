<?php

namespace App\Services\Finance;

use App\Domain\Finance\Services\ReportService;
use Illuminate\Http\Request;

class ReportExportService
{
    public function __construct(protected ReportService $reportService) {}

    /**
     * Get date range from request with defaults
     */
    public function getDateRange(Request $request, bool $periodBased = true): array
    {
        if ($periodBased) {
            $startDate = $request->input('start_date', now()->startOfMonth()->format('Y-m-d'));
            $endDate = $request->input('end_date', now()->endOfMonth()->format('Y-m-d'));
        } else {
            $startDate = $request->input('as_of', now()->format('Y-m-d'));
            $endDate = null;
        }

        return ['start_date' => $startDate, 'end_date' => $endDate];
    }

    /**
     * Export Profit & Loss report as PDF
     */
    public function exportProfitLossPdf(string $startDate, string $endDate)
    {
        $report = $this->reportService->getProfitAndLoss($startDate, $endDate);
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('reports.profit_loss_pdf', ['data' => $report]);

        return $pdf->download("laporan-laba-rugi-{$startDate}-{$endDate}.pdf");
    }

    /**
     * Export Profit & Loss report as Excel
     */
    public function exportProfitLossExcel(string $startDate, string $endDate)
    {
        $report = $this->reportService->getProfitAndLoss($startDate, $endDate);

        return \Maatwebsite\Excel\Facades\Excel::download(
            new \App\Exports\ProfitLossExport($report, $startDate, $endDate),
            "laba-rugi-{$startDate}-{$endDate}.xlsx"
        );
    }

    /**
     * Export Balance Sheet report as PDF
     */
    public function exportBalanceSheetPdf(string $asOfDate)
    {
        $report = $this->reportService->getBalanceSheet($asOfDate);
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('reports.balance_sheet_pdf', [
            'data' => $report,
            'asOf' => $asOfDate,
        ]);

        return $pdf->download("neraca-{$asOfDate}.pdf");
    }

    /**
     * Export Balance Sheet report as Excel
     */
    public function exportBalanceSheetExcel(string $asOfDate)
    {
        $report = $this->reportService->getBalanceSheet($asOfDate);

        return \Maatwebsite\Excel\Facades\Excel::download(
            new \App\Exports\BalanceSheetExport($report, $asOfDate),
            "neraca-{$asOfDate}.xlsx"
        );
    }

    /**
     * Export Cash Flow report as PDF
     */
    public function exportCashFlowPdf(string $startDate, string $endDate)
    {
        $report = $this->reportService->getCashFlow($startDate, $endDate);
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('reports.cash_flow_pdf', [
            'data' => $report,
            'start' => $startDate,
            'end' => $endDate,
        ]);

        return $pdf->download("laporan-arus-kas-{$startDate}-{$endDate}.pdf");
    }

    /**
     * Export Cash Flow report as Excel
     */
    public function exportCashFlowExcel(string $startDate, string $endDate)
    {
        $report = $this->reportService->getCashFlow($startDate, $endDate);

        return \Maatwebsite\Excel\Facades\Excel::download(
            new \App\Exports\CashFlowExport($report, $startDate, $endDate),
            "arus-kas-{$startDate}-{$endDate}.xlsx"
        );
    }
}
