<?php

namespace App\Http\Controllers\Api\Percetakan;

use App\Http\Controllers\Controller;
use App\Models\Percetakan\JobCard;
use App\Models\Percetakan\ProductionJob;
use App\Http\Resources\Percetakan\JobCardResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class JobCardController extends Controller
{
    /**
     * Display a listing of job cards.
     */
    public function index(Request $request)
    {
        $query = JobCard::with(['productionJob.order', 'qcBy']);

        // Filter by production job
        if ($request->filled('production_job_id')) {
            $query->where('production_job_id', $request->production_job_id);
        }

        // Filter by QC status
        if ($request->has('qc_passed')) {
            $query->where('qc_passed', $request->qc_passed);
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->get('per_page', 15);
        $jobCards = $query->paginate($perPage);

        return JobCardResource::collection($jobCards);
    }

    /**
     * Store a newly created job card.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'production_job_id' => ['required', 'exists:percetakan_production_jobs,id'],
            'instructions' => ['required', 'array'],
            'setup_time_minutes' => ['nullable', 'integer', 'min:0'],
            'run_time_minutes' => ['nullable', 'integer', 'min:0'],
        ]);

        // Generate card number
        $cardNumber = 'CARD-' . date('Ymd') . '-' . str_pad(JobCard::whereDate('created_at', today())->count() + 1, 4, '0', STR_PAD_LEFT);

        $jobCard = JobCard::create([
            'card_number' => $cardNumber,
            'production_job_id' => $validated['production_job_id'],
            'instructions' => $validated['instructions'],
            'setup_time_minutes' => $validated['setup_time_minutes'] ?? 0,
            'run_time_minutes' => $validated['run_time_minutes'] ?? 0,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Job card berhasil dibuat',
            'data' => new JobCardResource($jobCard->load(['productionJob.order'])),
        ], 201);
    }

    /**
     * Display the specified job card.
     */
    public function show(JobCard $jobCard): JsonResponse
    {
        $jobCard->load(['productionJob.order.customer', 'qcBy']);

        return response()->json([
            'success' => true,
            'data' => new JobCardResource($jobCard),
        ]);
    }

    /**
     * Update the specified job card.
     */
    public function update(Request $request, JobCard $jobCard): JsonResponse
    {
        $validated = $request->validate([
            'instructions' => ['sometimes', 'array'],
            'setup_time_minutes' => ['nullable', 'integer', 'min:0'],
            'run_time_minutes' => ['nullable', 'integer', 'min:0'],
            'actual_start' => ['nullable', 'date'],
            'actual_end' => ['nullable', 'date'],
            'actual_quantity' => ['nullable', 'integer', 'min:0'],
            'waste_quantity' => ['nullable', 'integer', 'min:0'],
            'material_used' => ['nullable', 'array'],
            'operator_notes' => ['nullable', 'string'],
            'qc_notes' => ['nullable', 'string'],
            'qc_passed' => ['nullable', 'boolean'],
        ]);

        $jobCard->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Job card berhasil diupdate',
            'data' => new JobCardResource($jobCard->fresh(['productionJob'])),
        ]);
    }

    /**
     * Start job card work.
     */
    public function start(JobCard $jobCard): JsonResponse
    {
        $jobCard->update(['actual_start' => now()]);

        return response()->json([
            'success' => true,
            'message' => 'Job card started',
            'data' => new JobCardResource($jobCard),
        ]);
    }

    /**
     * Complete job card work.
     */
    public function complete(Request $request, JobCard $jobCard): JsonResponse
    {
        $validated = $request->validate([
            'actual_quantity' => ['required', 'integer', 'min:0'],
            'waste_quantity' => ['nullable', 'integer', 'min:0'],
            'material_used' => ['nullable', 'array'],
            'operator_notes' => ['nullable', 'string'],
        ]);

        $jobCard->update([
            'actual_end' => now(),
            'actual_quantity' => $validated['actual_quantity'],
            'waste_quantity' => $validated['waste_quantity'] ?? 0,
            'material_used' => $validated['material_used'] ?? null,
            'operator_notes' => $validated['operator_notes'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Job card completed',
            'data' => new JobCardResource($jobCard),
        ]);
    }

    /**
     * Perform QC on job card.
     */
    public function qc(Request $request, JobCard $jobCard): JsonResponse
    {
        $validated = $request->validate([
            'qc_passed' => ['required', 'boolean'],
            'qc_notes' => ['required_if:qc_passed,false', 'nullable', 'string'],
        ]);

        $jobCard->update([
            'qc_passed' => $validated['qc_passed'],
            'qc_notes' => $validated['qc_notes'] ?? null,
            'qc_by' => auth()->id(),
            'qc_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => $validated['qc_passed'] ? 'QC passed' : 'QC failed',
            'data' => new JobCardResource($jobCard),
        ]);
    }

    /**
     * Get job card statistics.
     */
    public function statistics(): JsonResponse
    {
        $stats = [
            'total_cards' => JobCard::count(),
            'qc_status' => [
                'pending' => JobCard::whereNull('qc_passed')->count(),
                'passed' => JobCard::where('qc_passed', true)->count(),
                'failed' => JobCard::where('qc_passed', false)->count(),
            ],
            'today' => [
                'started' => JobCard::whereDate('actual_start', today())->count(),
                'completed' => JobCard::whereDate('actual_end', today())->count(),
            ],
            'efficiency' => [
                'avg_setup_time_minutes' => JobCard::where('setup_time_minutes', '>', 0)
                    ->avg('setup_time_minutes') ?? 0,
                'avg_run_time_minutes' => JobCard::where('run_time_minutes', '>', 0)
                    ->avg('run_time_minutes') ?? 0,
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}
