<?php

namespace App\Http\Resources\Percetakan;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerResource extends JsonResource
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
            'full_name' => $this->full_name,
            'type' => $this->type,
            'type_label' => ucfirst($this->type),
            'email' => $this->email,
            'phone' => $this->phone,
            'company_name' => $this->company_name,
            'npwp' => $this->npwp,
            'address' => $this->address,
            'city' => $this->city,
            'province' => $this->province,
            'postal_code' => $this->postal_code,
            'full_address' => $this->getFullAddress(),
            'credit' => [
                'limit' => $this->credit_limit,
                'formatted_limit' => 'Rp ' . number_format($this->credit_limit, 0, ',', '.'),
                'payment_terms_days' => $this->payment_terms_days,
                'discount_percentage' => $this->discount_percentage,
            ],
            'status' => $this->status,
            'status_label' => ucfirst($this->status),
            'is_active' => $this->status === 'active',
            'is_corporate' => $this->isCorporate(),
            'user' => [
                'id' => $this->user_id,
                'name' => $this->when($this->user, fn() => $this->user->name),
                'email' => $this->when($this->user, fn() => $this->user->email),
            ],
            'orders_count' => $this->whenCounted('orders'),
            'recent_orders' => OrderResource::collection($this->whenLoaded('orders')),
            'notes' => $this->notes,
            'created_at' => $this->created_at->format('Y-m-d H:i'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i'),
        ];
    }

    /**
     * Get full address string.
     */
    protected function getFullAddress(): ?string
    {
        $parts = array_filter([
            $this->address,
            $this->city,
            $this->province,
            $this->postal_code,
        ]);

        return !empty($parts) ? implode(', ', $parts) : null;
    }
}
