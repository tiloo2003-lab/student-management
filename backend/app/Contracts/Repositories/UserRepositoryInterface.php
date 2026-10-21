<?php

namespace App\Contracts\Repositories;

use App\Models\User;

interface UserRepositoryInterface extends BaseRepositoryInterface
{
    public function findByEmail(string $email): ?User;

    public function withProfile(User $user): User;

    public function issueToken(User $user, string $name): string;

    public function revokeCurrentToken(User $user): void;

    public function refresh(User $user): User;
}