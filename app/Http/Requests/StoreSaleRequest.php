<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\ValidationException;

class StoreSaleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check() && auth()->user()->hasPermissionTo('publishing_write');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'book_id' => ['required', 'exists:books,id'],
            'marketplace_id' => ['required', 'exists:marketplaces,id'],
            'transaction_id' => ['nullable', 'string', 'max:255'],
            'period_month' => ['required', 'string', 'regex:/^\d{4}-(0[1-9]|1[0-2])$/'],
            'quantity' => ['required', 'integer', 'min:1'],
            'net_price' => ['required', 'numeric', 'min:0'],
            'status' => ['nullable', 'in:completed,refunded'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'book_id.required' => 'Buku harus dipilih.',
            'marketplace_id.required' => 'Marketplace harus dipilih.',
            'period_month.required' => 'Periode bulan wajib diisi.',
            'period_month.regex' => 'Format periode bulan harus YYYY-MM (contoh: 2026-02).',
            'quantity.required' => 'Jumlah penjualan wajib diisi.',
            'quantity.min' => 'Jumlah penjualan minimal 1.',
            'net_price.required' => 'Harga bersih wajib diisi.',
            'net_price.numeric' => 'Harga bersih harus berupa angka.',
        ];
    }

    /**
     * Handle a failed validation attempt.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    protected function failedValidation(\Illuminate\Contracts\Validation\Validator $validator)
    {
        throw ValidationException::withMessages($validator->errors()->messages());
    }
}
