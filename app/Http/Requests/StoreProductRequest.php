<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'sku' => 'required|string|max:50|unique:products,sku',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'category' => 'required|string|max:100',
            'unit' => 'required|string|max:20',
            'unit_price' => 'required|numeric|min:0.01',
            'cost_price' => 'required|numeric|min:0.01',
            'stock' => 'required|integer|min:0',
            'stock_min' => 'required|integer|min:0',
            'reorder_quantity' => 'required|integer|min:1',
            'warehouse_id' => 'required|exists:warehouses,id',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'notes' => 'nullable|string|max:1000',
        ];
    }

    protected function prepareForValidation(): void
    {
        $stock = $this->input('stock', $this->input('quantity_on_hand'));
        $stockMin = $this->input('stock_min', $this->input('reorder_level'));

        $this->merge(array_filter([
            'stock' => $stock,
            'stock_min' => $stockMin,
        ], static fn ($value) => $value !== null));
    }

    public function messages(): array
    {
        return [
            'sku.unique' => 'SKU sudah terdaftar',
            'unit_price.min' => 'Harga satuan harus lebih besar dari 0',
        ];
    }
}
