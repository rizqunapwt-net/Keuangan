<?php

namespace App\Http\Requests\Percetakan;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'customer_id' => ['sometimes', 'exists:percetakan_customers,id'],
            'product_id' => ['sometimes', 'exists:percetakan_products,id'],
            'quantity' => ['sometimes', 'integer', 'min:1'],
            'status' => ['sometimes', Rule::in(['inquiry', 'quoted', 'confirmed', 'in_production', 'completed', 'ready_delivery', 'delivered', 'cancelled'])],
            'deadline' => ['nullable', 'date'],
            'priority' => ['nullable', Rule::in(['low', 'normal', 'high', 'urgent'])],
            'is_rush_order' => ['boolean'],
            'specifications' => ['sometimes', 'array'],
            'unit_price' => ['sometimes', 'numeric', 'min:0'],
            'discount_amount' => ['nullable', 'numeric', 'min:0'],
            'deposit_percentage' => ['nullable', 'numeric', 'between:0,100'],
            'deposit_paid' => ['nullable', 'numeric', 'min:0'],
            'production_notes' => ['nullable', 'string'],
            'customer_notes' => ['nullable', 'string'],
        ];
    }
}
