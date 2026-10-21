<?php

namespace App\Http\Controllers\Api;

use App\Contracts\Services\AuthServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\ChangePasswordRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\UpdateProfileRequest;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(private AuthServiceInterface $auth)
    {
    }

    public function login(LoginRequest $request)
    {
        return $this->auth->login($request->validated('email'), $request->validated('password'), (string) $request->ip());
    }

    public function me(Request $request)
    {
        return $this->auth->profile($request->user());
    }

    public function logout(Request $request)
    {
        $this->auth->logout($request->user());

        return ['message' => 'Đã đăng xuất.'];
    }

    public function updateProfile(UpdateProfileRequest $request)
    {
        return $this->auth->updateProfile($request->user(), $request->validated());
    }

    public function changePassword(ChangePasswordRequest $request)
    {
        $this->auth->changePassword($request->user(), $request->validated('current_password'), $request->validated('password'));

        return ['message' => 'Đổi mật khẩu thành công.'];
    }
}
