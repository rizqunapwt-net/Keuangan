<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\PrintOrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Percetakan\UpdateOrderStatusRequest;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class PercetakanController extends Controller
{
    use ApiResponse;

    public function customers(Request $request): JsonResponse
    {
        $query = DB::table('percetakan_customers')
            ->when($request->filled('search'), function ($q) use ($request): void {
                $search = (string) $request->string('search');
                $q->where(function ($sub) use ($search): void {
                    $sub->where('name', 'like', "%{$search}%")
                        ->orWhere('company_name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('status'), fn ($q) => $q->where('status', (string) $request->string('status')))
            ->whereNull('deleted_at')
            ->orderByDesc('id');

        $customers = $query->paginate((int) $request->input('per_page', 15));

        return $this->success($customers);
    }

    public function materials(Request $request): JsonResponse
    {
        $query = DB::table('percetakan_materials')
            ->when($request->filled('search'), function ($q) use ($request): void {
                $search = (string) $request->string('search');
                $q->where(function ($sub) use ($search): void {
                    $sub->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%");
                });
            })
            ->when($request->boolean('low_stock'), fn ($q) => $q->whereColumn('current_stock', '<=', 'min_stock'))
            ->whereNull('deleted_at')
            ->where('is_active', true)
            ->orderByDesc('id');

        $materials = $query->paginate((int) $request->input('per_page', 15));

        return $this->success($materials);
    }

    public function orders(Request $request): JsonResponse
    {
        $query = DB::table('percetakan_orders as o')
            ->leftJoin('percetakan_customers as c', 'c.id', '=', 'o.customer_id')
            ->leftJoin('users as u', 'u.id', '=', 'o.sales_id')
            ->select([
                'o.*',
                'c.name as customer_name',
                'c.company_name as customer_company_name',
                'u.name as sales_name',
            ])
            ->when($request->filled('status'), fn ($q) => $q->where('o.status', (string) $request->string('status')))
            ->when($request->filled('search'), function ($q) use ($request): void {
                $search = (string) $request->string('search');
                $q->where(function ($sub) use ($search): void {
                    $sub->where('o.order_number', 'like', "%{$search}%")
                        ->orWhere('c.name', 'like', "%{$search}%")
                        ->orWhere('c.company_name', 'like', "%{$search}%");
                });
            })
            ->whereNull('o.deleted_at')
            ->orderByDesc('o.id');

        $orders = $query->paginate((int) $request->input('per_page', 15));

        return $this->success($orders);
    }

    public function updateOrderStatus(UpdateOrderStatusRequest $request, int $orderId): JsonResponse
    {
        $order = DB::table('percetakan_orders as o')
            ->leftJoin('percetakan_customers as c', 'c.id', '=', 'o.customer_id')
            ->select([
                'o.id',
                'o.order_number',
                'o.status',
                'o.total_amount',
                'o.production_notes',
                'c.name as customer_name',
            ])
            ->where('o.id', $orderId)
            ->whereNull('o.deleted_at')
            ->first();

        if (! $order) {
            return $this->error('Order percetakan tidak ditemukan.', 404);
        }

        $newStatus = PrintOrderStatus::from((string) $request->string('status'));
        $currentStatus = PrintOrderStatus::tryFrom((string) $order->status);

        if (
            $currentStatus !== null
            && $currentStatus !== $newStatus
            && ! $currentStatus->canTransitionTo($newStatus)
        ) {
            return $this->error(
                sprintf(
                    'Transisi status dari "%s" ke "%s" tidak diizinkan.',
                    $currentStatus->value,
                    $newStatus->value
                ),
                422
            );
        }

        $notes = trim((string) $request->input('notes', ''));

        $updatePayload = [
            'status' => $newStatus->value,
            'updated_at' => now(),
        ];

        if ($notes !== '') {
            $updatePayload['production_notes'] = $notes;
        }

        DB::table('percetakan_orders')
            ->where('id', $orderId)
            ->update($updatePayload);

        $this->reportProductionProgress($order, $currentStatus, $newStatus, $notes);

        $updatedOrder = DB::table('percetakan_orders')
            ->select(['id', 'order_number', 'status', 'total_amount', 'production_notes', 'updated_at'])
            ->where('id', $orderId)
            ->first();

        return $this->success([
            'id' => $updatedOrder?->id,
            'order_number' => $updatedOrder?->order_number,
            'status' => $updatedOrder?->status,
            'status_label' => $newStatus->label(),
            'previous_status' => $currentStatus?->value,
            'customer_name' => $order->customer_name,
            'total_amount' => (float) $order->total_amount,
            'production_notes' => $updatedOrder?->production_notes,
            'coordinated_with_finance' => $this->shouldCoordinateFinance($currentStatus, $newStatus),
        ]);
    }

    private function shouldCoordinateFinance(?PrintOrderStatus $currentStatus, PrintOrderStatus $newStatus): bool
    {
        return $newStatus === PrintOrderStatus::COMPLETED
            && $currentStatus !== PrintOrderStatus::COMPLETED;
    }

    private function reportProductionProgress(
        object $order,
        ?PrintOrderStatus $currentStatus,
        PrintOrderStatus $newStatus,
        string $notes = ''
    ): void {
        $reportStatus = match ($newStatus) {
            PrintOrderStatus::COMPLETED,
            PrintOrderStatus::DELIVERED => 'completed',
            PrintOrderStatus::CANCELLED => 'blocked',
            default => 'in_progress',
        };

        $statusBefore = $currentStatus?->value ?? (string) $order->status;
        $summaryNotes = sprintf(
            'Status produksi order %s (%s): %s -> %s.',
            $order->order_number,
            $order->customer_name ?? 'customer_tidak_diketahui',
            $statusBefore,
            $newStatus->value
        );

        if ($notes !== '') {
            $summaryNotes .= ' Catatan: '.$notes;
        }

        $this->appendProgressLog(
            $reportStatus,
            'Produksi Order '.$order->order_number,
            $summaryNotes
        );

        if ($this->shouldCoordinateFinance($currentStatus, $newStatus)) {
            $this->appendProgressLog(
                'in_progress',
                'Koordinasi Invoice ke Agent Finance',
                sprintf(
                    'Order %s selesai. Mohon terbitkan invoice untuk customer %s dengan total %.2f. Agent Percetakan tidak membuat modul invoice.',
                    $order->order_number,
                    $order->customer_name ?? 'customer_tidak_diketahui',
                    (float) $order->total_amount
                )
            );
        }
    }

    private function appendProgressLog(string $status, string $taskName, string $notes): void
    {
        $logDir = base_path('.agents_mcp/logs');
        File::ensureDirectoryExists($logDir);

        $logEntry = sprintf(
            '%s- [%s] %s: %s (at %s)',
            PHP_EOL,
            strtoupper($status),
            $taskName,
            $notes,
            now()->toDateTimeString()
        );

        File::append($logDir.'/activity.log', $logEntry);
    }
}
