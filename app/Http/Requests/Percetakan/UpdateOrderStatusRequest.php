<?php

namespace App\Http\Requests\Percetakan;

use App\Enums\PrintOrderStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOrderStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'status' => ['required', 'string', Rule::in(PrintOrderStatus::values())],
            'notes' => ['nullable', 'string'],
        ];
    }
}
