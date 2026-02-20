<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreContractRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasAnyRole(['Admin', 'Legal']) ?? false;
    }

    public function rules(): array
    {
        return [
            'book_id' => ['required', 'integer', 'exists:books,id'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after:start_date'],
            'royalty_percentage' => ['required', 'numeric', 'min:0', 'max:100'],
            'contract_file' => ['required', 'file', 'mimes:pdf', 'max:10240'],
        ];
    }
}
