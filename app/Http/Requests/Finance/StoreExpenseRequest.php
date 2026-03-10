<?php

namespace App\Http\Requests\Finance;

use Illuminate\Foundation\Http\FormRequest;

class StoreExpenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'refNumber' => 'required|string|unique:accounting_expenses,ref_number',
            'transDate' => 'required|date',
            'accountId' => 'required|exists:accounting_accounts,id',
            'payFromAccountId' => 'required|exists:accounting_accounts,id',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'nullable|string|max:500',
        ];
    }
}
