<?php

namespace App\Http\Resources\Percetakan;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JobCardResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'card_number' => $this->card_number,
            'production_job' => [
                'id' => $this->production_job_id,
                'job_number' => $this->when($this->productionJob, fn() => $this->productionJob->job_number),
                'stage' => $this->when($this->productionJob, fn() => $this->productionJob->stage),
            ],
            'instructions' => $this->instructions,
            'timing' => [
                'setup_minutes' => $this->setup_time_minutes,
                'run_minutes' => $this->run_time_minutes,
                'actual_start' => $this->actual_start?->format('Y-m-d H:i'),
                'actual_end' => $this->actual_end?->format('Y-m-d H:i'),
                'total_minutes' => ($this->setup_time_minutes ?? 0) + ($this->run_time_minutes ?? 0),
            ],
            'quantity' => [
                'actual' => $this->actual_quantity,
                'waste' => $this->waste_quantity,
                'efficiency_percentage' => $this->actual_quantity && $this->waste_quantity
                    ? round(($this->actual_quantity / ($this->actual_quantity + $this->waste_quantity)) * 100, 2)
                    : null,
            ],
            'material_used' => $this->material_used,
            'notes' => [
                'operator' => $this->operator_notes,
                'qc' => $this->qc_notes,
            ],
            'qc' => [
                'passed' => $this->qc_passed,
                'qc_by' => [
                    'id' => $this->qc_by,
                    'name' => $this->when($this->qcBy, fn() => $this->qcBy->name),
                ],
                'qc_at' => $this->qc_at?->format('Y-m-d H:i'),
            ],
            'created_at' => $this->created_at->format('Y-m-d H:i'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i'),
        ];
    }
}
