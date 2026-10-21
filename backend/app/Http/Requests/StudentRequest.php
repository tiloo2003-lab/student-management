<?php

namespace App\Http\Requests;

use App\Contracts\Repositories\StudentRepositoryInterface;
use Illuminate\Validation\Rule;

class StudentRequest extends ApiFormRequest
{
    public function rules(): array
    {
        $id = $this->routeId('student');
        $userId = $id ? app(StudentRepositoryInterface::class)->find($id)?->user_id : null;

        return [
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:150', Rule::unique('users', 'email')->ignore($userId)],
            'phone' => ['nullable', 'string', 'max:20'],
            'password' => ['nullable', 'string', 'min:6'],
            'status' => ['nullable', 'in:active,inactive'],
            'class_id' => ['required', 'exists:classes,id'],
            'student_code' => ['required', 'string', 'max:20', Rule::unique('students', 'student_code')->ignore($id)],
            'date_of_birth' => ['nullable', 'date', 'before:today'],
            'gender' => ['required', 'in:male,female,other'],
            'address' => ['nullable', 'string', 'max:255'],
        ];
    }
}