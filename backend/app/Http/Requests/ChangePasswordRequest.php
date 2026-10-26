<?php

namespace App\Http\Requests;

class ChangePasswordRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'regex:/[A-Za-z]/', 'regex:/\d/', 'confirmed'],
        ];
    }

    public function messages(): array
    {
        return [
            'password.min' => 'The new password must be at least 8 characters.',
            'password.regex' => 'The new password must contain both letters and numbers.',
            'password.confirmed' => 'The password confirmation does not match.',
        ];
    }
}
