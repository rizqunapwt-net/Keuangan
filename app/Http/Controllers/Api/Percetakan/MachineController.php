<?php

namespace App\Http\Controllers\Api\Percetakan;

use App\Http\Controllers\Controller;
use App\Models\Percetakan\Machine;
use App\Http\Resources\Percetakan\MachineResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MachineController extends Controller
{
    /**
     * Display a listing of machines.
     */
    public function index(Request $request)
    {
        $query = Machine::query();

        // Filter by type
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by operational status
        if ($request->has('operational')) {
            $query->where('status', $request->operational ? 'operational' : '!=', 'operational');
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
        $machines = $query->paginate($perPage);

        return MachineResource::collection($machines);
    }

    /**
     * Store a newly created machine.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50', 'unique:percetakan_machines,code'],
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:offset,digital,cutting,binding,laminating,other'],
            'brand' => ['nullable', 'string', 'max:100'],
            'model' => ['nullable', 'string', 'max:100'],
            'capacity_per_hour' => ['nullable', 'integer', 'min:0'],
            'status' => ['sometimes', 'in:operational,maintenance,broken,decommissioned'],
            'purchase_date' => ['nullable', 'date'],
            'purchase_price' => ['nullable', 'numeric', 'min:0'],
            'warranty_months' => ['nullable', 'integer', 'min:0'],
            'last_maintenance' => ['nullable', 'date'],
            'next_maintenance' => ['nullable', 'date'],
            'total_operating_hours' => ['nullable', 'numeric', 'min:0', 'default:0'],
            'notes' => ['nullable', 'string'],
        ]);

        $machine = Machine::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Machine berhasil dibuat',
            'data' => new MachineResource($machine),
        ], 201);
    }

    /**
     * Display the specified machine.
     */
    public function show(Machine $machine): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => new MachineResource($machine),
        ]);
    }

    /**
     * Update the specified machine.
     */
    public function update(Request $request, Machine $machine): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['sometimes', 'string', 'max:50', 'unique:percetakan_machines,code,' . $machine->id],
            'name' => ['sometimes', 'string', 'max:255'],
            'type' => ['sometimes', 'in:offset,digital,cutting,binding,laminating,other'],
            'brand' => ['nullable', 'string', 'max:100'],
            'model' => ['nullable', 'string', 'max:100'],
            'capacity_per_hour' => ['nullable', 'integer', 'min:0'],
            'status' => ['sometimes', 'in:operational,maintenance,broken,decommissioned'],
            'purchase_date' => ['nullable', 'date'],
            'purchase_price' => ['nullable', 'numeric', 'min:0'],
            'warranty_months' => ['nullable', 'integer', 'min:0'],
            'last_maintenance' => ['nullable', 'date'],
            'next_maintenance' => ['nullable', 'date'],
            'total_operating_hours' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $machine->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Machine berhasil diupdate',
            'data' => new MachineResource($machine),
        ]);
    }

    /**
     * Remove the specified machine.
     */
    public function destroy(Machine $machine): JsonResponse
    {
        $machine->update(['is_active' => false]);

        return response()->json([
            'success' => true,
            'message' => 'Machine berhasil dihapus (soft delete)',
        ]);
    }

    /**
     * Update machine status.
     */
    public function updateStatus(Request $request, Machine $machine): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:operational,maintenance,broken,decommissioned'],
            'notes' => ['nullable', 'string'],
        ]);

        $oldStatus = $machine->status;
        $machine->update($validated);

        // Log status change
        \Log::info('Machine status updated', [
            'machine_id' => $machine->id,
            'machine_code' => $machine->code,
            'old_status' => $oldStatus,
            'new_status' => $machine->status,
            'user_id' => auth()->id(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Machine status berhasil diupdate',
            'data' => [
                'old_status' => $oldStatus,
                'new_status' => $machine->status,
                'machine' => new MachineResource($machine),
            ],
        ]);
    }

    /**
     * Log maintenance for machine.
     */
    public function logMaintenance(Request $request, Machine $machine): JsonResponse
    {
        $validated = $request->validate([
            'maintenance_type' => ['required', 'in:routine,repair,overhaul'],
            'description' => ['required', 'string'],
            'cost' => ['nullable', 'numeric', 'min:0'],
            'technician' => ['nullable', 'string', 'max:255'],
            'next_maintenance_date' => ['nullable', 'date'],
        ]);

        $machine->update([
            'last_maintenance' => now(),
            'next_maintenance' => $validated['next_maintenance_date'] ?? $machine->next_maintenance,
            'notes' => ($machine->notes ?? '') . "\n[Maintenance " . now()->format('Y-m-d') . "] " . 
                      $validated['maintenance_type'] . ": " . $validated['description'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Maintenance logged successfully',
            'data' => new MachineResource($machine),
        ]);
    }

    /**
     * Update operating hours.
     */
    public function updateOperatingHours(Request $request, Machine $machine): JsonResponse
    {
        $validated = $request->validate([
            'hours' => ['required', 'numeric', 'min:0'],
            'job_reference' => ['nullable', 'string'],
        ]);

        $oldHours = $machine->total_operating_hours;
        $machine->increment('total_operating_hours', $validated['hours']);

        \Log::info('Machine operating hours updated', [
            'machine_id' => $machine->id,
            'machine_code' => $machine->code,
            'old_hours' => $oldHours,
            'new_hours' => $machine->total_operating_hours,
            'hours_added' => $validated['hours'],
            'job_reference' => $validated['job_reference'],
            'user_id' => auth()->id(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Operating hours updated',
            'data' => new MachineResource($machine),
        ]);
    }

    /**
     * Get machines needing maintenance.
     */
    public function needsMaintenance(): JsonResponse
    {
        $machines = Machine::where('status', 'operational')
            ->where(function($q) {
                $q->whereNull('next_maintenance')
                  ->orWhereDate('next_maintenance', '<=', now()->addDays(7));
            })
            ->where('is_active', true)
            ->get();

        return response()->json([
            'success' => true,
            'data' => MachineResource::collection($machines),
        ]);
    }

    /**
     * Get machine statistics.
     */
    public function statistics(): JsonResponse
    {
        $stats = [
            'total_machines' => Machine::where('is_active', true)->count(),
            'by_type' => [
                'offset' => Machine::where('type', 'offset')->where('is_active', true)->count(),
                'digital' => Machine::where('type', 'digital')->where('is_active', true)->count(),
                'cutting' => Machine::where('type', 'cutting')->where('is_active', true)->count(),
                'binding' => Machine::where('type', 'binding')->where('is_active', true)->count(),
                'laminating' => Machine::where('type', 'laminating')->where('is_active', true)->count(),
            ],
            'by_status' => [
                'operational' => Machine::where('status', 'operational')->where('is_active', true)->count(),
                'maintenance' => Machine::where('status', 'maintenance')->where('is_active', true)->count(),
                'broken' => Machine::where('status', 'broken')->where('is_active', true)->count(),
                'decommissioned' => Machine::where('status', 'decommissioned')->where('is_active', true)->count(),
            ],
            'needs_maintenance_soon' => Machine::where('status', 'operational')
                ->where(function($q) {
                    $q->whereNull('next_maintenance')
                      ->orWhereDate('next_maintenance', '<=', now()->addDays(7));
                })
                ->where('is_active', true)
                ->count(),
            'total_value' => Machine::where('is_active', true)
                ->sum('purchase_price') ?? 0,
            'avg_operating_hours' => Machine::where('is_active', true)
                ->avg('total_operating_hours') ?? 0,
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}
