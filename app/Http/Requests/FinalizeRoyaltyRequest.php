<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FinalizeRoyaltyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('Finance') ?? false;
    }

    public function rules(): array
    {
        return [];
    }
}
