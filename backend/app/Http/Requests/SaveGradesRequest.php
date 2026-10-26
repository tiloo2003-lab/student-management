<?php

namespace App\Http\Requests;

class SaveGradesRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'grades' => ['required', 'array', 'min:1'],
            'grades.*.enrollment_id' => ['required', 'integer'],
            'grades.*.midterm' => ['nullable', 'numeric', 'between:0,10'],
            'grades.*.final' => ['nullable', 'numeric', 'between:0,10'],
        ];
    }

    public function messages(): array
    {
        return [
            'grades.required' => 'Please enter scores for at least one student.',
            'grades.*.midterm.between' => 'The midterm score must be between 0 and 10.',
            'grades.*.final.between' => 'The final score must be between 0 and 10.',
            'grades.*.midterm.numeric' => 'The midterm score must be a number.',
            'grades.*.final.numeric' => 'The final score must be a number.',
        ];
    }
}
