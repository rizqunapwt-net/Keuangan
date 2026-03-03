<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBankRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        $bankId = $this->route('bank')?->id;

        return [
            'bank_name' => 'required|string|max:100',
            'branch_name' => 'required|string|max:100',
            'account_number' => 'required|string|max:30|unique:banks,account_number,'.$bankId,
            'account_holder' => 'required|string|max:100',
            'account_type' => 'required|string|max:50',
            'currency' => 'required|string|size:3',
            'notes' => 'nullable|string|max:1000',
        ];
    }
}
