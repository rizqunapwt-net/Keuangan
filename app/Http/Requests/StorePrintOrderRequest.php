<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePrintOrderRequest extends FormRequest
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
            'vendor_name' => ['required', 'string', 'max:255'],
            'vendor_contact' => ['nullable', 'string', 'max:255'],
            'quantity' => ['required', 'integer', 'min:1'],
            'unit_cost' => ['required', 'numeric', 'min:0'],
            'paper_type' => ['nullable', 'string', 'max:255', 'default:Perfect Binding'],
            'binding_type' => ['nullable', 'string', 'max:255', 'default:Perfect Binding'],
            'cover_type' => ['nullable', 'string', 'max:255', 'default:Soft Cover'],
            'page_count' => ['nullable', 'integer', 'min:1'],
            'size' => ['nullable', 'string', 'max:50', 'default:A5'],
            'status' => ['nullable', 'in:pending,approved,in_production,qc,delivered,cancelled'],
            'ordered_at' => ['nullable', 'date'],
            'expected_delivery' => ['nullable', 'date', 'after_or_equal:ordered_at'],
            'notes' => ['nullable', 'string'],
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
            'book_id.exists' => 'Buku tidak ditemukan.',
            'vendor_name.required' => 'Nama vendor wajib diisi.',
            'quantity.required' => 'Jumlah cetak wajib diisi.',
            'quantity.min' => 'Jumlah cetak minimal 1.',
            'unit_cost.required' => 'Harga satuan wajib diisi.',
            'unit_cost.numeric' => 'Harga satuan harus berupa angka.',
            'expected_delivery.after_or_equal' => 'Tanggal pengiriman harus setelah tanggal order.',
        ];
    }
}
