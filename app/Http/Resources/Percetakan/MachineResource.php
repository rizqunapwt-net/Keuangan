<?php

namespace App\Http\Resources\Percetakan;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MachineResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'name' => $this->name,
            'type' => $this->type,
            'type_label' => ucfirst($this->type),
            'brand' => $this->brand,
            'model' => $this->model,
            'capacity_per_hour' => $this->capacity_per_hour,
            'status' => $this->status,
            'status_label' => $this->getStatusLabel(),
            'is_operational' => $this->status === 'operational',
            'purchase' => [
                'date' => $this->purchase_date?->format('Y-m-d'),
                'price' => $this->purchase_price,
                'formatted_price' => $this->purchase_price 
                    ? 'Rp ' . number_format($this->purchase_price, 0, ',', '.') 
                    : null,
            ],
            'warranty' => [
                'months' => $this->warranty_months,
                'expires' => $this->purchase_date && $this->warranty_months
                    ? $this->purchase_date->addMonths($this->warranty_months)->format('Y-m-d')
                    : null,
            ],
            'maintenance' => [
                'last' => $this->last_maintenance?->format('Y-m-d'),
                'next' => $this->next_maintenance?->format('Y-m-d'),
                'is_due_soon' => $this->next_maintenance && $this->next_maintenance->diffInDays(now()) <= 7,
                'is_overdue' => $this->next_maintenance && $this->next_maintenance->isPast(),
            ],
            'operating_hours' => [
                'total' => $this->total_operating_hours,
                'formatted' => number_format($this->total_operating_hours, 2) . ' hours',
            ],
            'notes' => $this->notes,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at->format('Y-m-d H:i'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i'),
        ];
    }

    protected function getStatusLabel(): string
    {
        $labels = [
            'operational' => 'Operational',
            'maintenance' => 'In Maintenance',
            'broken' => 'Broken',
            'decommissioned' => 'Decommissioned',
        ];

        return $labels[$this->status] ?? $this->status;
    }
}
