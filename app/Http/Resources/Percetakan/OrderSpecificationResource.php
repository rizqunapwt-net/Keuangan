<?php

namespace App\Http\Resources\Percetakan;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderSpecificationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'size' => $this->size,
            'paper_type' => $this->paper_type,
            'paper_weight' => $this->paper_weight,
            'full_paper_spec' => $this->full_paper_spec,
            'colors' => [
                'inside' => $this->colors_inside,
                'outside' => $this->colors_outside,
                'description' => $this->colors_description,
            ],
            'binding_type' => $this->binding_type,
            'finishing' => $this->finishing,
            'pages_count' => $this->pages_count,
            'print_run' => $this->print_run,
            'waste_allowance' => $this->waste_allowance,
            'custom_fields' => $this->custom_fields,
        ];
    }
}
