<?php

namespace App\Http\Resources\Percetakan;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MaterialResource extends JsonResource
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
            'category' => $this->category,
            'category_label' => ucfirst($this->category),
            'type' => $this->type,
            'specification' => $this->specification,
            'full_specification' => $this->type && $this->specification 
                ? "{$this->type} {$this->specification}" 
                : ($this->type ?? $this->specification),
            'unit' => $this->unit,
            'stock' => [
                'current' => $this->current_stock,
                'min' => $this->min_stock,
                'max' => $this->max_stock,
                'status' => $this->getStockStatus(),
                'is_low' => $this->current_stock <= $this->min_stock,
                'is_out' => $this->current_stock == 0,
            ],
            'pricing' => [
                'unit_cost' => $this->unit_cost,
                'formatted_unit_cost' => 'Rp ' . number_format($this->unit_cost, 0, ',', '.'),
                'last_purchase_price' => $this->last_purchase_price,
                'formatted_last_purchase' => $this->last_purchase_price 
                    ? 'Rp ' . number_format($this->last_purchase_price, 0, ',', '.') 
                    : null,
            ],
            'inventory_value' => $this->current_stock * $this->unit_cost,
            'formatted_inventory_value' => 'Rp ' . number_format($this->current_stock * $this->unit_cost, 0, ',', '.'),
            'supplier' => [
                'id' => $this->supplier_id,
            ],
            'location' => $this->location,
            'last_purchase_date' => $this->last_purchase_date?->format('Y-m-d'),
            'is_active' => $this->is_active,
            'created_at' => $this->created_at->format('Y-m-d H:i'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i'),
        ];
    }

    protected function getStockStatus(): string
    {
        if ($this->current_stock == 0) {
            return 'out_of_stock';
        } elseif ($this->current_stock <= $this->min_stock) {
            return 'low';
        } elseif ($this->max_stock && $this->current_stock >= $this->max_stock) {
            return 'overstocked';
        } else {
            return 'normal';
        }
    }
}
