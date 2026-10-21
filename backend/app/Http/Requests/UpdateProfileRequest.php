<?php

namespace App\Http\Requests;

class UpdateProfileRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'phone' => ['nullable', 'string', 'max:20'],
        ];
    }
}