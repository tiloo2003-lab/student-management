<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class SchoolClassRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:20', Rule::unique('classes', 'code')->ignore($this->routeId('class'))],
            'name' => ['required', 'string', 'max:120'],
            'department_id' => ['required', 'exists:departments,id'],
            'homeroom_teacher_id' => ['nullable', 'exists:teachers,id'],
            'academic_year' => ['nullable', 'string', 'max:20'],
        ];
    }
}