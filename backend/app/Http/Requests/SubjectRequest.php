<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class SubjectRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:20', Rule::unique('subjects', 'code')->ignore($this->routeId('subject'))],
            'name' => ['required', 'string', 'max:150'],
            'credits' => ['required', 'integer', 'between:1,10'],
            'department_id' => ['required', 'exists:departments,id'],
            'description' => ['nullable', 'string'],
        ];
    }
}