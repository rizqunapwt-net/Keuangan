<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Accounting\Expense;
use App\Models\Author;
use App\Models\Book;
use App\Models\Payment;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminDashboardController extends Controller
{
    use ApiResponse;

    public function books(Request $request): JsonResponse
    {
        $query = Book::with('author')->latest();

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', "%{$request->search}%")
                    ->orWhere('isbn', 'like', "%{$request->search}%");
            });
        }

        return $this->success($query->get());
    }

    public function authors(Request $request): JsonResponse
    {
        $query = Author::latest();

        if ($request->filled('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        return $this->success($query->get());
    }

    public function bookStats(): JsonResponse
    {
        return $this->success([
            'total' => Book::count(),
            'published' => Book::where('status', 'published')->count(),
            'draft' => Book::where('status', 'draft')->count(),
            'archived' => Book::where('status', 'archived')->count(),
        ]);
    }

    public function authorStats(): JsonResponse
    {
        return $this->success([
            'total' => Author::count(),
            'active' => Author::where('status', 'active')->count(),
            'inactive' => Author::where('status', 'inactive')->count(),
        ]);
    }

    /**
     * Get consolidated financial stats for the Dashboard.
     */
    public function salesStats(): JsonResponse
    {
        $currentMonth = now()->month;
        $currentYear = now()->year;

        $monthlyExpenses = Expense::where('status', 'recorded')
            ->whereMonth('date', $currentMonth)
            ->whereYear('date', $currentYear)
            ->sum('amount');

        $outstandingInvoices = Payment::where('status', 'unpaid')->sum('amount');

        return $this->success([
            'summary' => [
                'totalExpenses' => (float) $monthlyExpenses,
                'outstandingInvoices' => (float) $outstandingInvoices,
            ],
            'recentTransactions' => Payment::with('user:id,name')
                ->latest()
                ->take(5)
                ->get()
                ->map(fn ($p) => [
                    'id' => $p->id,
                    'type' => 'Payment',
                    'amount' => $p->amount,
                    'status' => $p->status,
                    'date' => $p->created_at->format('Y-m-d H:i'),
                ]),
        ]);
    }
}
