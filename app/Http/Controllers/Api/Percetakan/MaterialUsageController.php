<?php

namespace App\Http\Controllers\Api\Percetakan;

use App\Http\Controllers\Controller;
use App\Models\Percetakan\MaterialUsage;
use App\Models\Percetakan\Material;
use App\Http\Resources\Percetakan\MaterialUsageResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MaterialUsageController extends Controller
{
    /**
     * Display a listing of material usage.
     */
    public function index(Request $request)
    {
        $query = MaterialUsage::with(['jobCard.productionJob.order', 'material']);

        // Filter by job card
        if ($request->filled('job_card_id')) {
            $query->where('job_card_id', $request->job_card_id);
        }

        // Filter by material
        if ($request->filled('material_id')) {
            $query->where('material_id', $request->material_id);
        }

        // Filter by date range
        if ($request->filled('from_date')) {
            $query->whereHas('jobCard', function($q) use ($request) {
                $q->whereDate('created_at', '>=', $request->from_date);
            });
        }
        if ($request->filled('to_date')) {
            $query->whereHas('jobCard', function($q) use ($request) {
                $q->whereDate('created_at', '<=', $request->to_date);
            });
        }

        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->get('per_page', 15);
        $usage = $query->paginate($perPage);

        return MaterialUsageResource::collection($usage);
    }

    /**
     * Store a newly created material usage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'job_card_id' => ['required', 'exists:percetakan_job_cards,id'],
            'material_id' => ['required', 'exists:percetakan_materials,id'],
            'quantity_planned' => ['required', 'numeric', 'min:0'],
            'quantity_actual' => ['nullable', 'numeric', 'min:0'],
            'quantity_waste' => ['nullable', 'numeric', 'min:0'],
            'unit_cost' => ['required', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
        ]);

        // Calculate total cost
        $quantity = $validated['quantity_actual'] ?? $validated['quantity_planned'];
        $totalCost = $quantity * $validated['unit_cost'];

        $materialUsage = MaterialUsage::create([
            'job_card_id' => $validated['job_card_id'],
            'material_id' => $validated['material_id'],
            'quantity_planned' => $validated['quantity_planned'],
            'quantity_actual' => $validated['quantity_actual'] ?? null,
            'quantity_waste' => $validated['quantity_waste'] ?? 0,
            'unit_cost' => $validated['unit_cost'],
            'total_cost' => $totalCost,
            'notes' => $validated['notes'] ?? null,
        ]);

        // Update material stock if actual quantity is provided
        if (isset($validated['quantity_actual'])) {
            $material = Material::find($validated['material_id']);
            if ($material) {
                $totalUsed = $validated['quantity_actual'] + ($validated['quantity_waste'] ?? 0);
                $material->decrement('current_stock', $totalUsed);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Material usage recorded',
            'data' => new MaterialUsageResource($materialUsage->load(['jobCard.productionJob.order', 'material'])),
        ], 201);
    }

    /**
     * Display the specified material usage.
     */
    public function show(MaterialUsage $materialUsage): JsonResponse
    {
        $materialUsage->load(['jobCard.productionJob.order.customer', 'material']);

        return response()->json([
            'success' => true,
            'data' => new MaterialUsageResource($materialUsage),
        ]);
    }

    /**
     * Update the specified material usage.
     */
    public function update(Request $request, MaterialUsage $materialUsage): JsonResponse
    {
        $validated = $request->validate([
            'quantity_planned' => ['sometimes', 'numeric', 'min:0'],
            'quantity_actual' => ['nullable', 'numeric', 'min:0'],
            'quantity_waste' => ['nullable', 'numeric', 'min:0'],
            'unit_cost' => ['sometimes', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
        ]);

        if (isset($validated['quantity_actual']) || isset($validated['unit_cost'])) {
            $quantity = $validated['quantity_actual'] ?? $materialUsage->quantity_actual ?? $validated['quantity_planned'] ?? $materialUsage->quantity_planned;
            $unitCost = $validated['unit_cost'] ?? $materialUsage->unit_cost;
            $validated['total_cost'] = $quantity * $unitCost;
        }

        $materialUsage->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Material usage updated',
            'data' => new MaterialUsageResource($materialUsage->fresh(['jobCard', 'material'])),
        ]);
    }

    /**
     * Remove the specified material usage.
     */
    public function destroy(MaterialUsage $materialUsage): JsonResponse
    {
        $materialUsage->delete();

        return response()->json([
            'success' => true,
            'message' => 'Material usage deleted',
        ]);
    }

    /**
     * Get material usage statistics.
     */
    public function statistics(Request $request): JsonResponse
    {
        $stats = [
            'total_usage_records' => MaterialUsage::count(),
            'total_cost' => MaterialUsage::sum('total_cost') ?? 0,
            'by_material' => MaterialUsage::selectRaw('material_id, SUM(total_cost) as total_cost')
                ->groupBy('material_id')
                ->with('material:id,code,name')
                ->get()
                ->map(fn($item) => [
                    'material_id' => $item->material_id,
                    'material_name' => $item->material?->name,
                    'total_cost' => $item->total_cost,
                ]),
            'waste_percentage' => MaterialUsage::selectRaw('SUM(quantity_waste) as waste, SUM(quantity_actual) as actual')
                ->first(),
        ];

        // Calculate waste percentage
        if ($stats['waste_percentage']) {
            $waste = $stats['waste_percentage']->waste ?? 0;
            $actual = $stats['waste_percentage']->actual ?? 0;
            $stats['waste_percentage'] = ($actual > 0) ? round(($waste / ($actual + $waste)) * 100, 2) : 0;
        }

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}
