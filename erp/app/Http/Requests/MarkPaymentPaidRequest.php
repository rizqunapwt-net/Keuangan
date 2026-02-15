<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MarkPaymentPaidRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('Finance') ?? false;
    }

    public function rules(): array
    {
        return [
            'payment_reference' => ['nullable', 'string', 'max:255'],
            'paid_at' => ['nullable', 'date'],
        ];
    }
}
