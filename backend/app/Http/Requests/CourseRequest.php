<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class CourseRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:20', Rule::unique('courses', 'code')->ignore($this->routeId('course'))],
            'subject_id' => ['required', 'exists:subjects,id'],
            'teacher_id' => ['required', 'exists:teachers,id'],
            'semester_id' => ['required', 'exists:semesters,id'],
            'room' => ['nullable', 'string', 'max:30'],
            'day_of_week' => ['nullable', 'integer', 'between:2,8'],
            'start_period' => ['nullable', 'integer', 'between:1,15'],
            'end_period' => ['nullable', 'integer', 'between:1,15', 'gte:start_period'],
            'max_students' => ['required', 'integer', 'between:1,500'],
        ];
    }
}