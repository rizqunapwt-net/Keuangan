<?php

namespace App\Http\Requests\Finance;

use Illuminate\Foundation\Http\FormRequest;

class StoreJournalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'date' => 'required|date',
            'description' => 'required|string|max:500',
            'reference' => 'nullable|string|max:100',
            'items' => 'required|array|min:2',
            'items.*.account_id' => 'required|exists:accounting_accounts,id',
            'items.*.type' => 'required|in:debit,credit',
            'items.*.amount' => 'required|numeric|min:0',
        ];
    }
}
