<?php

namespace App\Http\Requests;

class SaveAttendanceRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'date' => ['required', 'date'],
            'records' => ['required', 'array', 'min:1'],
            'records.*.student_id' => ['required', 'integer'],
            'records.*.status' => ['required', 'in:present,absent,late,excused'],
            'records.*.note' => ['nullable', 'string', 'max:255'],
        ];
    }
}