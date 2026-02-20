<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePrintOrderRequest;
use App\Http\Requests\StoreSaleRequest;
use App\Models\Book;
use App\Models\PrintOrder;
use App\Models\Sale;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookOrderController extends Controller
{
    /**
     * Display a listing of print orders.
     */
    public function orders(Request $request)
    {
        $query = PrintOrder::with(['book.author', 'orderer'])
            ->orderBy('created_at', 'desc');

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by book_id
        if ($request->filled('book_id')) {
            $query->where('book_id', $request->book_id);
        }

        // Filter by date range
        if ($request->filled('from_date')) {
            $query->whereDate('ordered_at', '>=', $request->from_date);
        }
        if ($request->filled('to_date')) {
            $query->whereDate('ordered_at', '<=', $request->to_date);
        }

        $perPage = $request->get('per_page', 15);
        $orders = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $orders->items(),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
            ],
        ]);
    }

    /**
     * Store a new print order.
     */
    public function storeOrder(StorePrintOrderRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $validated['ordered_by'] = auth()->id();
        $validated['ordered_at'] = $validated['ordered_at'] ?? now();

        $order = PrintOrder::create($validated);

        // Update book stock if status is delivered
        if ($order->status === 'delivered') {
            $order->book->increment('stock', $order->quantity);
            $order->delivered_at = now();
            $order->save();
        }

        return response()->json([
            'success' => true,
            'message' => 'Print order created successfully',
            'data' => $order->load(['book.author', 'orderer']),
        ], 201);
    }

    /**
     * Update print order status.
     */
    public function updateOrderStatus(Request $request, PrintOrder $order): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:pending,approved,in_production,qc,delivered,cancelled',
        ]);

        $order->update(['status' => $request->status]);

        // Auto update delivered_at when status is delivered
        if ($request->status === 'delivered') {
            $order->delivered_at = now();
            $order->book->increment('stock', $order->quantity);
            $order->save();
        }

        return response()->json([
            'success' => true,
            'message' => 'Order status updated successfully',
            'data' => $order->load(['book.author', 'orderer']),
        ]);
    }

    /**
     * Display a listing of sales.
     */
    public function sales(Request $request)
    {
        $query = Sale::with(['book.author', 'marketplace', 'importer'])
            ->orderBy('created_at', 'desc');

        // Filter by book_id
        if ($request->filled('book_id')) {
            $query->where('book_id', $request->book_id);
        }

        // Filter by marketplace_id
        if ($request->filled('marketplace_id')) {
            $query->where('marketplace_id', $request->marketplace_id);
        }

        // Filter by period_month
        if ($request->filled('period_month')) {
            $query->where('period_month', $request->period_month);
        }

        // Filter by date range
        if ($request->filled('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }
        if ($request->filled('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        $perPage = $request->get('per_page', 15);
        $sales = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $sales->items(),
            'meta' => [
                'current_page' => $sales->currentPage(),
                'last_page' => $sales->lastPage(),
                'per_page' => $sales->perPage(),
                'total' => $sales->total(),
            ],
        ]);
    }

    /**
     * Store a new sale.
     */
    public function storeSale(StoreSaleRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $validated['imported_by'] = auth()->id();

        $sale = Sale::create($validated);

        // Decrement book stock
        $sale->book->decrement('stock', $sale->quantity);

        return response()->json([
            'success' => true,
            'message' => 'Sale recorded successfully',
            'data' => $sale->load(['book.author', 'marketplace']),
        ], 201);
    }

    /**
     * Get sales statistics.
     */
    public function salesStats(Request $request): JsonResponse
    {
        $periodMonth = $request->get('period_month', now()->format('Y-m'));

        $totalSales = Sale::where('period_month', $periodMonth)->sum('quantity');
        $totalRevenue = Sale::where('period_month', $periodMonth)->sum(\DB::raw('quantity * net_price'));
        $totalTransactions = Sale::where('period_month', $periodMonth)->count();

        $salesByBook = Sale::selectRaw('book_id, SUM(quantity) as total_qty, SUM(quantity * net_price) as total_revenue')
            ->where('period_month', $periodMonth)
            ->groupBy('book_id')
            ->with('book')
            ->orderBy('total_revenue', 'desc')
            ->limit(10)
            ->get();

        $salesByMarketplace = Sale::selectRaw('marketplace_id, SUM(quantity) as total_qty, SUM(quantity * net_price) as total_revenue')
            ->where('period_month', $periodMonth)
            ->groupBy('marketplace_id')
            ->with('marketplace')
            ->orderBy('total_revenue', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'period_month' => $periodMonth,
                'total_sales' => $totalSales,
                'total_revenue' => $totalRevenue,
                'total_transactions' => $totalTransactions,
                'top_books' => $salesByBook,
                'sales_by_marketplace' => $salesByMarketplace,
            ],
        ]);
    }
}
