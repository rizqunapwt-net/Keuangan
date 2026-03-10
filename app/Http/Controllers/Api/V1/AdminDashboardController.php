<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Accounting\Expense;
use App\Models\Debt;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    use ApiResponse;

    /**
     * Get consolidated financial stats for the Dashboard.
     */
    public function salesStats(): JsonResponse
    {
        $currentMonth = now()->month;
        $currentYear = now()->year;

        // Monthly Expenses (Operational)
        $monthlyExpenses = Expense::where('status', 'recorded')
            ->whereMonth('date', $currentMonth)
            ->whereYear('date', $currentYear)
            ->sum('amount');

        // Outstanding Invoices (Receivables that are unpaid or partial)
        $outstandingInvoices = Debt::where('type', 'receivable')
            ->whereIn('status', ['unpaid', 'partial'])
            ->get()
            ->sum(fn($d) => $d->amount - $d->paid_amount);

        // Recent Invoices / Receivables
        $recentInvoices = Debt::where('type', 'receivable')
            ->latest('date')
            ->take(5)
            ->get()
            ->map(fn ($d) => [
                'id' => $d->id,
                'type' => 'Invoice',
                'amount' => (float) $d->amount,
                'status' => $d->status,
                'date' => $d->date?->format('Y-m-d') . ' ' . $d->created_at->format('H:i'),
                'contact' => $d->client_name,
            ]);

        return $this->success([
            'summary' => [
                'totalExpenses' => (float) $monthlyExpenses,
                'outstandingInvoices' => (float) $outstandingInvoices,
            ],
            'recentTransactions' => $recentInvoices,
        ]);
    }
}
