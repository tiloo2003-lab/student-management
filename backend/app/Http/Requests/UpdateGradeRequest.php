<?php

namespace App\Http\Requests;

class UpdateGradeRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'midterm' => ['nullable', 'numeric', 'between:0,10'],
            'final' => ['nullable', 'numeric', 'between:0,10'],
        ];
    }
}