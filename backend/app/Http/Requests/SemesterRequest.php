<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class SemesterRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:60'],
            'academic_year' => ['required', 'string', 'max:20'],
            'term' => [
                'required', 'integer', 'between:1,3',
                Rule::unique('semesters')->where('academic_year', $this->input('academic_year'))->ignore($this->routeId('semester')),
            ],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after:start_date'],
            'is_current' => ['boolean'],
        ];
    }
}