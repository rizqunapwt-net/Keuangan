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
     */
    public function index(Request $request)
    {
        Gate::authorize('viewAny', AuditLog::class);

        $query = AuditLog::with('user')->latest();

        if ($request->has('event_type') && $request->event_type) {
            $query->where('event_type', $request->event_type);
        }

        if ($request->has('user_id') && $request->user_id) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('created_at', [
                $request->start_date,
                $request->end_date,
            ]);
        }

        if ($request->has('table_name') && $request->table_name) {
            $query->where('table_name', $request->table_name);
        }

        if ($request->has('search') && $request->search) {
            $query->where('description', 'like', '%'.$request->search.'%');
        }

        return response()->json(
            $query->paginate($request->get('per_page', 50))
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

        return response()->json([
            'total' => AuditLog::count(),
            'today' => AuditLog::where('created_at', '>=', $today)->count(),
            'by_event_type' => AuditLog::selectRaw('event_type, count(*) as count')
                ->groupBy('event_type')
                ->get()
                ->pluck('count', 'event_type'),
            'by_table' => AuditLog::selectRaw('table_name, count(*) as count')
                ->groupBy('table_name')
                ->get()
                ->pluck('count', 'table_name'),
        ]);
    }
}
