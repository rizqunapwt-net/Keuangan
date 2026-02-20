<?php

namespace App\Http\Controllers\Api\Percetakan;

use App\Http\Controllers\Controller;
use App\Http\Requests\Percetakan\StoreOrderRequest;
use App\Http\Requests\Percetakan\UpdateOrderRequest;
use App\Http\Resources\Percetakan\OrderResource;
use App\Models\Percetakan\Order;
use App\Models\Percetakan\OrderSpecification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    /**
     * Display a listing of orders.
     */
    public function index(Request $request)
    {
        $query = Order::with(['customer', 'product', 'specification', 'sales']);

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by customer
        if ($request->filled('customer_id')) {
            $query->where('customer_id', $request->customer_id);
        }

        // Filter by date range
        if ($request->filled('from_date')) {
            $query->whereDate('order_date', '>=', $request->from_date);
        }
        if ($request->filled('to_date')) {
            $query->whereDate('order_date', '<=', $request->to_date);
        }

        // Search by order number
        if ($request->filled('search')) {
            $query->where('order_number', 'like', '%' . $request->search . '%');
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->get('per_page', 15);
        $orders = $query->paginate($perPage);

        return OrderResource::collection($orders);
    }

    /**
     * Store a newly created order.
     */
    public function store(StoreOrderRequest $request): JsonResponse
    {
        // Generate order number
        $orderNumber = 'ORD-' . date('Ymd') . '-' . str_pad(Order::whereDate('created_at', today())->count() + 1, 4, '0', STR_PAD_LEFT);

        // Calculate pricing
        $quantity = $request->quantity;
        $unitPrice = $request->unit_price;
        $subtotal = $quantity * $unitPrice;
        $discountAmount = $request->discount_amount ?? 0;
        $taxAmount = ($subtotal - $discountAmount) * 0.11; // PPN 11%
        $totalAmount = $subtotal - $discountAmount + $taxAmount;
        
        // Calculate deposit
        $depositPercentage = $request->deposit_percentage ?? 50;
        $depositAmount = $totalAmount * ($depositPercentage / 100);

        // Create order
        $order = Order::create([
            'order_number' => $orderNumber,
            'customer_id' => $request->customer_id,
            'sales_id' => auth()->id(),
            'status' => 'inquiry',
            'product_id' => $request->product_id,
            'specifications' => $request->specifications,
            'quantity' => $quantity,
            'unit_price' => $unitPrice,
            'subtotal' => $subtotal,
            'discount_amount' => $discountAmount,
            'tax_amount' => $taxAmount,
            'total_amount' => $totalAmount,
            'deposit_percentage' => $depositPercentage,
            'deposit_amount' => $depositAmount,
            'deposit_paid' => 0,
            'balance_due' => $totalAmount,
            'order_date' => now()->format('Y-m-d'),
            'deadline' => $request->deadline,
            'priority' => $request->priority ?? 'normal',
            'is_rush_order' => $request->is_rush_order ?? false,
            'production_notes' => $request->production_notes,
            'customer_notes' => $request->customer_notes,
        ]);

        // Create order specifications
        OrderSpecification::create([
            'order_id' => $order->id,
            'size' => $request->specifications['size'],
            'paper_type' => $request->specifications['paper_type'],
            'paper_weight' => $request->specifications['paper_weight'],
            'colors_inside' => $request->specifications['colors_inside'],
            'colors_outside' => $request->specifications['colors_outside'],
            'binding_type' => $request->specifications['binding_type'] ?? null,
            'finishing' => $request->specifications['finishing'] ?? null,
            'pages_count' => $request->specifications['pages_count'] ?? null,
            'print_run' => $request->specifications['print_run'] ?? 1,
            'waste_allowance' => $request->specifications['waste_allowance'] ?? 5,
            'custom_fields' => $request->specifications['custom_fields'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Order berhasil dibuat',
            'data' => new OrderResource($order->load(['customer', 'product', 'specification'])),
        ], 201);
    }

    /**
     * Display the specified order.
     */
    public function show(Order $order): JsonResponse
    {
        $order->load(['customer', 'product', 'specification', 'productionJobs', 'invoices']);

        return response()->json([
            'success' => true,
            'data' => new OrderResource($order),
        ]);
    }

    /**
     * Update the specified order.
     */
    public function update(UpdateOrderRequest $request, Order $order): JsonResponse
    {
        $updateData = $request->validated();

        // Recalculate pricing if unit_price or quantity changed
        if (isset($updateData['unit_price']) || isset($updateData['quantity'])) {
            $quantity = $updateData['quantity'] ?? $order->quantity;
            $unitPrice = $updateData['unit_price'] ?? $order->unit_price;
            $subtotal = $quantity * $unitPrice;
            $discountAmount = $updateData['discount_amount'] ?? $order->discount_amount;
            $taxAmount = ($subtotal - $discountAmount) * 0.11;
            $totalAmount = $subtotal - $discountAmount + $taxAmount;
            
            $updateData['subtotal'] = $subtotal;
            $updateData['tax_amount'] = $taxAmount;
            $updateData['total_amount'] = $totalAmount;
            $updateData['balance_due'] = $totalAmount - ($order->deposit_paid ?? 0);
        }

        // Update specifications if provided
        if (isset($updateData['specifications'])) {
            $order->specification?->update([
                'size' => $updateData['specifications']['size'] ?? $order->specification->size,
                'paper_type' => $updateData['specifications']['paper_type'] ?? $order->specification->paper_type,
                'paper_weight' => $updateData['specifications']['paper_weight'] ?? $order->specification->paper_weight,
                'colors_inside' => $updateData['specifications']['colors_inside'] ?? $order->specification->colors_inside,
                'colors_outside' => $updateData['specifications']['colors_outside'] ?? $order->specification->colors_outside,
                'binding_type' => $updateData['specifications']['binding_type'] ?? $order->specification->binding_type,
                'finishing' => $updateData['specifications']['finishing'] ?? $order->specification->finishing,
                'pages_count' => $updateData['specifications']['pages_count'] ?? $order->specification->pages_count,
                'print_run' => $updateData['specifications']['print_run'] ?? $order->specification->print_run,
                'waste_allowance' => $updateData['specifications']['waste_allowance'] ?? $order->specification->waste_allowance,
            ]);
            unset($updateData['specifications']);
        }

        $order->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'Order berhasil diupdate',
            'data' => new OrderResource($order->fresh(['customer', 'product', 'specification'])),
        ]);
    }

    /**
     * Remove the specified order.
     */
    public function destroy(Order $order): JsonResponse
    {
        // Only cancel if not yet in production
        if (in_array($order->status, ['in_production', 'completed', 'delivered'])) {
            return response()->json([
                'success' => false,
                'message' => 'Order tidak dapat dibatalkan karena sudah dalam produksi',
            ], 422);
        }

        $order->update(['status' => 'cancelled']);

        return response()->json([
            'success' => true,
            'message' => 'Order berhasil dibatalkan',
        ]);
    }

    /**
     * Get order statistics.
     */
    public function statistics(): JsonResponse
    {
        $stats = [
            'total_orders' => Order::count(),
            'by_status' => [
                'inquiry' => Order::where('status', 'inquiry')->count(),
                'quoted' => Order::where('status', 'quoted')->count(),
                'confirmed' => Order::where('status', 'confirmed')->count(),
                'in_production' => Order::where('status', 'in_production')->count(),
                'completed' => Order::where('status', 'completed')->count(),
                'delivered' => Order::where('status', 'delivered')->count(),
            ],
            'this_month' => [
                'orders' => Order::whereMonth('created_at', now()->month)->count(),
                'revenue' => Order::whereMonth('created_at', now()->month)->sum('total_amount'),
            ],
            'pending_approval' => Order::whereIn('status', ['inquiry', 'quoted'])->count(),
            'urgent_orders' => Order::where('is_rush_order', true)->orWhere('priority', 'urgent')->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}
