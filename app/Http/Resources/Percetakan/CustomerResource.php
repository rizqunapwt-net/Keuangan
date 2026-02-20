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
            'address' => $this->address,
            'city' => $this->city,
            'province' => $this->province,
            'credit_limit' => $this->credit_limit,
            'formatted_credit_limit' => 'Rp ' . number_format($this->credit_limit, 0, ',', '.'),
            'payment_terms_days' => $this->payment_terms_days,
            'discount_percentage' => $this->discount_percentage,
            'status' => $this->status,
        ];
    }
}
