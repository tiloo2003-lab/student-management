<?php

namespace App\Http\Requests;

class AttendanceDateRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return ['date' => ['required', 'date']];
    }
}