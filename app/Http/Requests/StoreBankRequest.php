<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBankRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'bank_name' => 'required|string|max:100',
            'branch_name' => 'required|string|max:100',
            'account_number' => 'required|string|max:30|unique:banks,account_number',
            'account_holder' => 'required|string|max:100',
            'account_type' => 'required|string|max:50',
            'currency' => 'required|string|size:3',
            'opening_balance' => 'required|numeric|min:0',
            'opening_date' => 'required|date',
            'account_id' => 'required|exists:accounting_accounts,id',
            'notes' => 'nullable|string|max:1000',
        ];
    }

    public function messages(): array
    {
        return [
            'account_number.unique' => 'Nomor rekening sudah terdaftar',
            'currency.size' => 'Kode mata uang harus 3 karakter',
        ];
    }
}
