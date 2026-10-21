<?php

namespace App\Contracts\Services;

use App\Models\User;

interface AuthServiceInterface
{
    public function login(string $email, string $password, string $ip = ''): array;

    public function profile(User $user): array;

    public function logout(User $user): void;

    public function updateProfile(User $user, array $data): array;

    public function changePassword(User $user, string $current, string $new): void;
}