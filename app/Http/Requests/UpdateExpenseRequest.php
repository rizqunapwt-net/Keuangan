<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateExpenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'account_id' => 'required|exists:accounting_accounts,id',
            'description' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'amount' => 'required|numeric|min:0.01',
            'currency' => 'required|string|size:3',
            'expense_date' => 'required|date',
            'payment_method' => 'required|string|max:50',
            'reference_number' => 'nullable|string|max:50',
            'notes' => 'nullable|string|max:1000',
            'attachment_path' => 'nullable|file|mimes:pdf,jpg,png|max:5120',
        ];
    }
}
