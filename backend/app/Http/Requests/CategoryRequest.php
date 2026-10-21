<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class CategoryRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100', Rule::unique('categories', 'name')->ignore($this->routeId('category'))],
            'description' => ['nullable', 'string', 'max:255'],
        ];
    }
}