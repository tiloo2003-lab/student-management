<?php

namespace App\Services;

use App\Contracts\Repositories\UserRepositoryInterface;
use App\Contracts\Services\AuthServiceInterface;
use App\Contracts\Support\LoginThrottleInterface;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService implements AuthServiceInterface
{
    public function __construct(
        private UserRepositoryInterface $users,
        private LoginThrottleInterface $throttle,
    ) {
    }

    public function login(string $email, string $password, string $ip = ''): array
    {
        $key = 'login|' . strtolower($email) . '|' . $ip;

        if ($this->throttle->isLocked($key)) {
            $max = (int) config('school.login_max_attempts');
            $minutes = $this->throttle->retryAfterMinutes($key);

            throw ValidationException::withMessages([
                'email' => ["Đăng nhập sai quá {$max} lần. Vui lòng thử lại sau {$minutes} phút."],
            ]);
        }

        $user = $this->users->findByEmail($email);

        if (! $user || ! Hash::check($password, $user->password)) {
            $this->throttle->hit($key);

            throw ValidationException::withMessages(['email' => ['Email hoặc mật khẩu không đúng.']]);
        }

        if ($user->status !== 'active') {
            throw ValidationException::withMessages(['email' => ['Tài khoản đã bị khóa.']]);
        }

        $this->throttle->clear($key);

        return [
            'token' => $this->users->issueToken($user, 'spa'),
            'user' => $this->profile($user),
        ];
    }

    public function profile(User $user): array
    {
        return $this->users->withProfile($user)->toArray();
    }

    public function logout(User $user): void
    {
        $this->users->revokeCurrentToken($user);
    }

    public function updateProfile(User $user, array $data): array
    {
        $this->users->update($user, $data);

        return $this->profile($this->users->refresh($user));
    }

    public function changePassword(User $user, string $current, string $new): void
    {
        if (! Hash::check($current, $user->password)) {
            throw ValidationException::withMessages(['current_password' => ['Mật khẩu hiện tại không đúng.']]);
        }

        if (Hash::check($new, $user->password)) {
            throw ValidationException::withMessages(['password' => ['Mật khẩu mới phải khác mật khẩu hiện tại.']]);
        }

        $this->users->update($user, ['password' => $new]);
    }
}
