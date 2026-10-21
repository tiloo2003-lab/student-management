<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class DepartmentRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:20', Rule::unique('departments', 'code')->ignore($this->routeId('department'))],
            'name' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string'],
        ];
    }
}