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
            'password.min' => 'Mật khẩu mới phải có ít nhất 8 ký tự.',
            'password.regex' => 'Mật khẩu mới phải gồm cả chữ và số.',
            'password.confirmed' => 'Xác nhận mật khẩu không khớp.',
        ];
    }
}
