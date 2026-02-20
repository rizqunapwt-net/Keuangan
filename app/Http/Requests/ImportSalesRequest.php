<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ImportSalesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('Finance') ?? false;
    }

    public function rules(): array
    {
        return [
            'period_month' => ['required', 'regex:/^\d{4}-(0[1-9]|1[0-2])$/'],
            'marketplace_code' => ['required', 'string', 'max:50'],
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:10240'],
        ];
    }
}
