<?php

namespace App\Http\Controllers\Api\Percetakan;

use App\Http\Controllers\Controller;
use App\Models\Percetakan\ProductionJob;
use App\Models\Percetakan\Order;
use App\Http\Resources\Percetakan\ProductionJobResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class ProductionJobController extends Controller
{
    /**
     * Display a listing of production jobs.
     */
    public function index(Request $request)
    {
        $query = ProductionJob::with(['order.customer', 'machine', 'operator', 'supervisor', 'jobCards']);

        // Filter by stage
        if ($request->filled('stage')) {
            $query->where('stage', $request->stage);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by order
        if ($request->filled('order_id')) {
            $query->where('order_id', $request->order_id);
        }

        // Filter by machine
        if ($request->filled('machine_id')) {
            $query->where('machine_id', $request->machine_id);
        }

        // Filter by operator
        if ($request->filled('operator_id')) {
            $query->where('operator_id', $request->operator_id);
        }

        // Search by job number
        if ($request->filled('search')) {
            $query->where('job_number', 'like', '%' . $request->search . '%');
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->get('per_page', 15);
        $jobs = $query->paginate($perPage);

        return ProductionJobResource::collection($jobs);
    }

    /**
     * Store a newly created production job.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_id' => ['required', 'exists:percetakan_orders,id'],
            'stage' => ['required', 'in:pre-press,printing,finishing,qc,packaging'],
            'machine_id' => ['nullable', 'exists:percetakan_machines,id'],
            'operator_id' => ['nullable', 'exists:users,id'],
            'supervisor_id' => ['nullable', 'exists:users,id'],
            'instructions' => ['nullable', 'string'],
        ]);

        // Generate job number
        $jobNumber = 'JOB-' . date('Ymd') . '-' . str_pad(ProductionJob::whereDate('created_at', today())->count() + 1, 4, '0', STR_PAD_LEFT);

        $job = ProductionJob::create([
            'job_number' => $jobNumber,
            'order_id' => $validated['order_id'],
            'stage' => $validated['stage'],
            'status' => 'pending',
            'machine_id' => $validated['machine_id'] ?? null,
            'operator_id' => $validated['operator_id'] ?? null,
            'supervisor_id' => $validated['supervisor_id'] ?? null,
            'instructions' => $validated['instructions'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Production job berhasil dibuat',
            'data' => new ProductionJobResource($job->load(['order.customer', 'machine', 'operator'])),
        ], 201);
    }

    /**
     * Display the specified production job.
     */
    public function show(ProductionJob $productionJob): JsonResponse
    {
        $productionJob->load(['order.customer', 'machine', 'operator', 'supervisor', 'jobCards']);

        return response()->json([
            'success' => true,
            'data' => new ProductionJobResource($productionJob),
        ]);
    }

    /**
     * Update the specified production job.
     */
    public function update(Request $request, ProductionJob $productionJob): JsonResponse
    {
        $validated = $request->validate([
            'stage' => ['sometimes', 'in:pre-press,printing,finishing,qc,packaging'],
            'status' => ['sometimes', 'in:pending,in_progress,completed,on_hold,rejected'],
            'machine_id' => ['nullable', 'exists:percetakan_machines,id'],
            'operator_id' => ['nullable', 'exists:users,id'],
            'supervisor_id' => ['nullable', 'exists:users,id'],
            'started_at' => ['nullable', 'date'],
            'completed_at' => ['nullable', 'date'],
            'quantity_good' => ['nullable', 'integer', 'min:0'],
            'quantity_waste' => ['nullable', 'integer', 'min:0'],
            'instructions' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
        ]);

        $productionJob->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Production job berhasil diupdate',
            'data' => new ProductionJobResource($productionJob->fresh(['order.customer', 'machine', 'operator'])),
        ]);
    }

    /**
     * Start a production job.
     */
    public function start(ProductionJob $productionJob): JsonResponse
    {
        if ($productionJob->status === 'completed') {
            return response()->json([
                'success' => false,
                'message' => 'Job sudah selesai',
            ], 422);
        }

        $productionJob->update([
            'status' => 'in_progress',
            'started_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Production job dimulai',
            'data' => new ProductionJobResource($productionJob),
        ]);
    }

    /**
     * Complete a production job.
     */
    public function complete(Request $request, ProductionJob $productionJob): JsonResponse
    {
        $validated = $request->validate([
            'quantity_good' => ['required', 'integer', 'min:0'],
            'quantity_waste' => ['nullable', 'integer', 'min:0'],
            'notes' => ['nullable', 'string'],
        ]);

        $productionJob->update([
            'status' => 'completed',
            'completed_at' => now(),
            'quantity_good' => $validated['quantity_good'],
            'quantity_waste' => $validated['quantity_waste'] ?? 0,
            'notes' => $validated['notes'] ?? null,
        ]);

        // Auto-create next stage job if this is not the last stage
        $this->createNextStageJob($productionJob);

        return response()->json([
            'success' => true,
            'message' => 'Production job selesai',
            'data' => new ProductionJobResource($productionJob),
        ]);
    }

    /**
     * Put job on hold.
     */
    public function hold(ProductionJob $productionJob): JsonResponse
    {
        $productionJob->update(['status' => 'on_hold']);

        return response()->json([
            'success' => true,
            'message' => 'Production job dihentikan sementara',
            'data' => new ProductionJobResource($productionJob),
        ]);
    }

    /**
     * Reject a production job.
     */
    public function reject(Request $request, ProductionJob $productionJob): JsonResponse
    {
        $validated = $request->validate([
            'rejection_reason' => ['required', 'string'],
        ]);

        $productionJob->update([
            'status' => 'rejected',
            'notes' => ($productionJob->notes ?? '') . "\nRejection: " . $validated['rejection_reason'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Production job ditolak',
            'data' => new ProductionJobResource($productionJob),
        ]);
    }

    /**
     * Get production statistics.
     */
    public function statistics(): JsonResponse
    {
        $stats = [
            'total_jobs' => ProductionJob::count(),
            'by_stage' => [
                'pre-press' => ProductionJob::where('stage', 'pre-press')->count(),
                'printing' => ProductionJob::where('stage', 'printing')->count(),
                'finishing' => ProductionJob::where('stage', 'finishing')->count(),
                'qc' => ProductionJob::where('stage', 'qc')->count(),
                'packaging' => ProductionJob::where('stage', 'packaging')->count(),
            ],
            'by_status' => [
                'pending' => ProductionJob::where('status', 'pending')->count(),
                'in_progress' => ProductionJob::where('status', 'in_progress')->count(),
                'completed' => ProductionJob::where('status', 'completed')->count(),
                'on_hold' => ProductionJob::where('status', 'on_hold')->count(),
                'rejected' => ProductionJob::where('status', 'rejected')->count(),
            ],
            'efficiency' => [
                'avg_completion_time_hours' => ProductionJob::whereNotNull('completed_at')
                    ->whereNotNull('started_at')
                    ->selectRaw('AVG(TIMESTAMPDIFF(HOUR, started_at, completed_at)) as avg_hours')
                    ->value('avg_hours') ?? 0,
            ],
            'today' => [
                'started' => ProductionJob::whereDate('started_at', today())->count(),
                'completed' => ProductionJob::whereDate('completed_at', today())->count(),
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Create next stage production job.
     */
    private function createNextStageJob(ProductionJob $currentJob): void
    {
        $stageOrder = ['pre-press', 'printing', 'finishing', 'qc', 'packaging'];
        $currentIndex = array_search($currentJob->stage, $stageOrder);
        
        if ($currentIndex !== false && $currentIndex < count($stageOrder) - 1) {
            $nextStage = $stageOrder[$currentIndex + 1];
            
            ProductionJob::create([
                'job_number' => 'JOB-' . date('Ymd') . '-' . str_pad(ProductionJob::whereDate('created_at', today())->count() + 1, 4, '0', STR_PAD_LEFT),
                'order_id' => $currentJob->order_id,
                'stage' => $nextStage,
                'status' => 'pending',
                'machine_id' => null,
                'operator_id' => null,
                'supervisor_id' => null,
                'instructions' => "Auto-created from {$currentJob->stage} completion",
            ]);
        }
    }
}
