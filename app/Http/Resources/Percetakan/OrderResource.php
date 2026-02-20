<?php

namespace App\Http\Resources\Percetakan;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'status' => $this->status,
            'status_label' => $this->getStatusLabel(),
            'progress_percentage' => $this->progress_percentage,
            'customer' => new CustomerResource($this->whenLoaded('customer')),
            'product' => [
                'id' => $this->product_id,
                'name' => $this->when($this->product, fn() => $this->product->name),
                'code' => $this->when($this->product, fn() => $this->product->code),
            ],
            'specifications' => $this->specifications,
            'detailed_specifications' => new OrderSpecificationResource(
                $this->whenLoaded('specification')
            ),
            'quantity' => $this->quantity,
            'pricing' => [
                'unit_price' => $this->unit_price,
                'subtotal' => $this->subtotal,
                'discount' => $this->discount_amount,
                'tax' => $this->tax_amount,
                'total' => $this->total_amount,
                'formatted_total' => 'Rp ' . number_format($this->total_amount, 0, ',', '.'),
            ],
            'payment' => [
                'deposit_percentage' => $this->deposit_percentage,
                'deposit_amount' => $this->deposit_amount,
                'deposit_paid' => $this->deposit_paid,
                'deposit_balance' => $this->deposit_amount - $this->deposit_paid,
                'balance_due' => $this->balance_due,
                'formatted_balance' => 'Rp ' . number_format($this->balance_due, 0, ',', '.'),
            ],
            'dates' => [
                'order_date' => $this->order_date->format('Y-m-d'),
                'deadline' => $this->deadline?->format('Y-m-d'),
                'completed_at' => $this->completed_at?->format('Y-m-d H:i'),
                'delivered_at' => $this->delivered_at?->format('Y-m-d H:i'),
            ],
            'priority' => $this->priority,
            'is_rush_order' => $this->is_rush_order,
            'production_notes' => $this->production_notes,
            'customer_notes' => $this->customer_notes,
            'sales' => [
                'id' => $this->sales_id,
                'name' => $this->when($this->sales, fn() => $this->sales->name),
            ],
            'created_at' => $this->created_at->format('Y-m-d H:i'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i'),
        ];
    }

    protected function getStatusLabel(): string
    {
        $labels = [
            'inquiry' => 'Inquiry',
            'quoted' => 'Quoted',
            'confirmed' => 'Confirmed',
            'in_production' => 'In Production',
            'completed' => 'Completed',
            'ready_delivery' => 'Ready for Delivery',
            'delivered' => 'Delivered',
            'cancelled' => 'Cancelled',
        ];

        return $labels[$this->status] ?? $this->status;
    }
}
