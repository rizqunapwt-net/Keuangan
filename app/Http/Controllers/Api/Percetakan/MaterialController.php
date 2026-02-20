<?php

namespace App\Http\Controllers\Api\Percetakan;

use App\Http\Controllers\Controller;
use App\Models\Percetakan\Material;
use App\Http\Resources\Percetakan\MaterialResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MaterialController extends Controller
{
    /**
     * Display a listing of materials.
     */
    public function index(Request $request)
    {
        $query = Material::query();

        // Filter by category
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        // Filter by type
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        // Filter by stock level
        if ($request->has('low_stock')) {
            $query->whereColumn('current_stock', '<=', 'min_stock');
        }

        // Search by name or code
        if ($request->filled('search')) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('code', 'like', '%' . $request->search . '%');
            });
        }

        // Sort
        $sortBy = $request->get('sort_by', 'name');
        $sortOrder = $request->get('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->get('per_page', 15);
        $materials = $query->paginate($perPage);

        return MaterialResource::collection($materials);
    }

    /**
     * Store a newly created material.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50', 'unique:percetakan_materials,code'],
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'in:paper,ink,plate,consumable,packaging'],
            'type' => ['nullable', 'string', 'max:100'],
            'specification' => ['nullable', 'string', 'max:255'],
            'unit' => ['required', 'in:ream,sheet,liter,kg,pcs,roll,box'],
            'current_stock' => ['nullable', 'numeric', 'min:0', 'default:0'],
            'min_stock' => ['nullable', 'numeric', 'min:0', 'default:0'],
            'max_stock' => ['nullable', 'numeric', 'min:0'],
            'unit_cost' => ['nullable', 'numeric', 'min:0', 'default:0'],
            'last_purchase_price' => ['nullable', 'numeric', 'min:0'],
            'supplier_id' => ['nullable', 'integer'],
            'location' => ['nullable', 'string', 'max:100'],
        ]);

        $material = Material::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Material berhasil dibuat',
            'data' => new MaterialResource($material),
        ], 201);
    }

    /**
     * Display the specified material.
     */
    public function show(Material $material): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => new MaterialResource($material),
        ]);
    }

    /**
     * Update the specified material.
     */
    public function update(Request $request, Material $material): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['sometimes', 'string', 'max:50', 'unique:percetakan_materials,code,' . $material->id],
            'name' => ['sometimes', 'string', 'max:255'],
            'category' => ['sometimes', 'in:paper,ink,plate,consumable,packaging'],
            'type' => ['nullable', 'string', 'max:100'],
            'specification' => ['nullable', 'string', 'max:255'],
            'unit' => ['sometimes', 'in:ream,sheet,liter,kg,pcs,roll,box'],
            'current_stock' => ['sometimes', 'numeric', 'min:0'],
            'min_stock' => ['sometimes', 'numeric', 'min:0'],
            'max_stock' => ['sometimes', 'numeric', 'min:0'],
            'unit_cost' => ['sometimes', 'numeric', 'min:0'],
            'last_purchase_price' => ['nullable', 'numeric', 'min:0'],
            'supplier_id' => ['nullable', 'integer'],
            'location' => ['nullable', 'string', 'max:100'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $material->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Material berhasil diupdate',
            'data' => new MaterialResource($material),
        ]);
    }

    /**
     * Remove the specified material.
     */
    public function destroy(Material $material): JsonResponse
    {
        $material->update(['is_active' => false]);

        return response()->json([
            'success' => true,
            'message' => 'Material berhasil dihapus (soft delete)',
        ]);
    }

    /**
     * Adjust material stock.
     */
    public function adjustStock(Request $request, Material $material): JsonResponse
    {
        $validated = $request->validate([
            'adjustment_type' => ['required', 'in:add,subtract,set'],
            'quantity' => ['required', 'numeric'],
            'reason' => ['required', 'string'],
            'reference' => ['nullable', 'string'], // PO number, job card, etc
        ]);

        $oldStock = $material->current_stock;

        switch ($validated['adjustment_type']) {
            case 'add':
                $material->current_stock += $validated['quantity'];
                break;
            case 'subtract':
                $material->current_stock = max(0, $material->current_stock - $validated['quantity']);
                break;
            case 'set':
                $material->current_stock = $validated['quantity'];
                break;
        }

        $material->save();

        // Log stock adjustment (could be moved to separate table)
        \Log::info('Material stock adjusted', [
            'material_id' => $material->id,
            'material_code' => $material->code,
            'old_stock' => $oldStock,
            'new_stock' => $material->current_stock,
            'adjustment' => $validated['adjustment_type'],
            'quantity' => $validated['quantity'],
            'reason' => $validated['reason'],
            'reference' => $validated['reference'],
            'user_id' => auth()->id(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Stock berhasil disesuaikan',
            'data' => [
                'old_stock' => $oldStock,
                'new_stock' => $material->current_stock,
                'material' => new MaterialResource($material),
            ],
        ]);
    }

    /**
     * Get low stock materials.
     */
    public function lowStock(): JsonResponse
    {
        $materials = Material::whereColumn('current_stock', '<=', 'min_stock')
            ->where('is_active', true)
            ->orderBy('current_stock', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => MaterialResource::collection($materials),
        ]);
    }

    /**
     * Get material statistics.
     */
    public function statistics(): JsonResponse
    {
        $stats = [
            'total_materials' => Material::where('is_active', true)->count(),
            'by_category' => [
                'paper' => Material::where('category', 'paper')->where('is_active', true)->count(),
                'ink' => Material::where('category', 'ink')->where('is_active', true)->count(),
                'plate' => Material::where('category', 'plate')->where('is_active', true)->count(),
                'consumable' => Material::where('category', 'consumable')->where('is_active', true)->count(),
                'packaging' => Material::where('category', 'packaging')->where('is_active', true)->count(),
            ],
            'low_stock_count' => Material::whereColumn('current_stock', '<=', 'min_stock')
                ->where('is_active', true)
                ->count(),
            'out_of_stock_count' => Material::where('current_stock', 0)
                ->where('is_active', true)
                ->count(),
            'total_inventory_value' => Material::where('is_active', true)
                ->selectRaw('SUM(current_stock * unit_cost) as total_value')
                ->value('total_value') ?? 0,
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}
