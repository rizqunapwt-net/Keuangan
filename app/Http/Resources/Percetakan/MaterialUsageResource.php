<?php

namespace App\Http\Resources\Percetakan;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MaterialUsageResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'job_card' => [
                'id' => $this->job_card_id,
                'card_number' => $this->when($this->jobCard, fn() => $this->jobCard->card_number),
                'stage' => $this->when($this->jobCard, fn() => $this->jobCard->productionJob?->stage),
                'order_number' => $this->when($this->jobCard, fn() => $this->jobCard->productionJob?->order?->order_number),
            ],
            'material' => [
                'id' => $this->material_id,
                'code' => $this->when($this->material, fn() => $this->material->code),
                'name' => $this->when($this->material, fn() => $this->material->name),
                'full_specification' => $this->when($this->material, fn() => $this->material->full_specification),
            ],
            'quantity' => [
                'planned' => $this->quantity_planned,
                'actual' => $this->quantity_actual,
                'waste' => $this->quantity_waste,
                'total_used' => ($this->quantity_actual ?? 0) + ($this->quantity_waste ?? 0),
                'variance' => $this->quantity_actual 
                    ? round((($this->quantity_actual - $this->quantity_planned) / $this->quantity_planned) * 100, 2)
                    : null,
            ],
            'cost' => [
                'unit_cost' => $this->unit_cost,
                'total_cost' => $this->total_cost,
                'formatted_unit_cost' => 'Rp ' . number_format($this->unit_cost, 0, ',', '.'),
                'formatted_total_cost' => 'Rp ' . number_format($this->total_cost, 0, ',', '.'),
            ],
            'notes' => $this->notes,
            'created_at' => $this->created_at->format('Y-m-d H:i'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i'),
        ];
    }
}
