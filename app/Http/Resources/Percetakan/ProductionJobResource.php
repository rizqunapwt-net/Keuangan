<?php

namespace App\Http\Resources\Percetakan;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductionJobResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'job_number' => $this->job_number,
            'stage' => $this->stage,
            'stage_label' => ucfirst(str_replace('-', ' ', $this->stage)),
            'status' => $this->status,
            'status_label' => $this->getStatusLabel(),
            'order' => [
                'id' => $this->order_id,
                'order_number' => $this->when($this->order, fn() => $this->order->order_number),
                'customer_name' => $this->when($this->order, fn() => $this->order->customer?->name),
            ],
            'machine' => [
                'id' => $this->machine_id,
                'name' => $this->when($this->machine, fn() => $this->machine->name),
                'code' => $this->when($this->machine, fn() => $this->machine->code),
            ],
            'operator' => [
                'id' => $this->operator_id,
                'name' => $this->when($this->operator, fn() => $this->operator->name),
            ],
            'supervisor' => [
                'id' => $this->supervisor_id,
                'name' => $this->when($this->supervisor, fn() => $this->supervisor->name),
            ],
            'timing' => [
                'started_at' => $this->started_at?->format('Y-m-d H:i'),
                'completed_at' => $this->completed_at?->format('Y-m-d H:i'),
                'duration_hours' => $this->started_at && $this->completed_at 
                    ? round($this->started_at->diffInHours($this->completed_at), 2) 
                    : null,
            ],
            'quantity' => [
                'good' => $this->quantity_good,
                'waste' => $this->quantity_waste,
                'total' => ($this->quantity_good ?? 0) + ($this->quantity_waste ?? 0),
                'efficiency_percentage' => $this->efficiency,
            ],
            'instructions' => $this->instructions,
            'notes' => $this->notes,
            'job_cards_count' => $this->whenCounted('jobCards'),
            'created_at' => $this->created_at->format('Y-m-d H:i'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i'),
        ];
    }

    protected function getStatusLabel(): string
    {
        $labels = [
            'pending' => 'Pending',
            'in_progress' => 'In Progress',
            'completed' => 'Completed',
            'on_hold' => 'On Hold',
            'rejected' => 'Rejected',
        ];

        return $labels[$this->status] ?? $this->status;
    }
}
