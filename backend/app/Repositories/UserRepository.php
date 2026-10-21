<?php

namespace App\Repositories;

use App\Contracts\Repositories\UserRepositoryInterface;
use App\Models\User;

class UserRepository extends BaseRepository implements UserRepositoryInterface
{
    protected string $model = User::class;

    public function findByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }

    public function withProfile(User $user): User
    {
        return $user->load(['teacher.department:id,name', 'student.schoolClass:id,code,name']);
    }

    public function issueToken(User $user, string $name): string
    {
        return $user->createToken($name)->plainTextToken;
    }

    public function revokeCurrentToken(User $user): void
    {
        $user->currentAccessToken()?->delete();
    }

    public function refresh(User $user): User
    {
        return $user->fresh();
    }
}