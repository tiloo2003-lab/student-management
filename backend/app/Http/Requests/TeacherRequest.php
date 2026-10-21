<?php

namespace App\Http\Requests;

use App\Contracts\Repositories\TeacherRepositoryInterface;
use Illuminate\Validation\Rule;

class TeacherRequest extends ApiFormRequest
{
    public function rules(): array
    {
        $id = $this->routeId('teacher');
        $userId = $id ? app(TeacherRepositoryInterface::class)->find($id)?->user_id : null;

        return [
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:150', Rule::unique('users', 'email')->ignore($userId)],
            'phone' => ['nullable', 'string', 'max:20'],
            'password' => ['nullable', 'string', 'min:6'],
            'status' => ['nullable', 'in:active,inactive'],
            'department_id' => ['required', 'exists:departments,id'],
            'teacher_code' => ['required', 'string', 'max:20', Rule::unique('teachers', 'teacher_code')->ignore($id)],
            'degree' => ['nullable', 'string', 'max:50'],
            'specialization' => ['nullable', 'string', 'max:150'],
            'hired_date' => ['nullable', 'date'],
        ];
    }
}