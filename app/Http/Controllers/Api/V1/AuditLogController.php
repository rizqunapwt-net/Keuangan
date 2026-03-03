<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class AuditLogController extends Controller
{
    /**
     * Tampilkan daftar audit logs
     * Hanya bisa diakses oleh admin
     */
    public function index(Request $request)
    {
        Gate::authorize('viewAny', AuditLog::class);

        $query = AuditLog::with('user')->latest();

        // Filter by event type
        if ($request->has('event_type')) {
            $query->where('event_type', $request->event_type);
        }

        // Filter by user
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Filter by date range
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('created_at', [
                $request->start_date,
                $request->end_date
            ]);
        }

        // Filter by table name
        if ($request->has('table_name')) {
            $query->where('table_name', $request->table_name);
        }

        // Search in description
        if ($request->has('search')) {
            $query->where('description', 'like', '%' . $request->search . '%');
        }

        return response()->json(
            $query->paginate($request->get('per_page', 20))
        );
    }

    /**
     * Tampilkan detail audit log
     */
    public function show(AuditLog $auditLog)
    {
        Gate::authorize('view', $auditLog);

        return response()->json($auditLog->load('user'));
    }

    /**
     * Get audit log statistics
     */
    public function stats()
    {
        Gate::authorize('viewAny', AuditLog::class);

        $today = now()->startOfDay();
        $yesterday = now()->subDay()->startOfDay();

        return response()->json([
            'total' => AuditLog::count(),
            'today' => AuditLog::where('created_at', '>=', $today)->count(),
            'by_event_type' => AuditLog::selectRaw('event_type, count(*) as count')
                ->groupBy('event_type')
                ->get()
                ->pluck('count', 'event_type'),
            'by_user' => AuditLog::selectRaw('user_id, count(*) as count')
                ->groupBy('user_id')
                ->with('user:id,name')
                ->get()
                ->map(fn($item) => [
                    'user_id' => $item->user_id,
                    'user_name' => $item->user?->name ?? 'Unknown',
                    'count' => $item->count,
                ]),
            'recent_deletes' => AuditLog::ofType('deleted')
                ->latest()
                ->take(5)
                ->get(['id', 'event_type', 'auditable_type', 'auditable_id', 'table_name', 'description', 'user_id', 'created_at']),
        ]);
    }
}
