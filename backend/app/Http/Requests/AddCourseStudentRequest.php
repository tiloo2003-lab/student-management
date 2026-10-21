<?php

namespace App\Http\Requests;

class AddCourseStudentRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return ['student_id' => ['required', 'exists:students,id']];
    }
}