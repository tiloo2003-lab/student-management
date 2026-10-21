<?php

namespace App\Support;

use App\Contracts\Support\LoginThrottleInterface;
use Illuminate\Support\Facades\RateLimiter;

class CacheLoginThrottle implements LoginThrottleInterface
{
    public function isLocked(string $key): bool
    {
        return RateLimiter::tooManyAttempts($key, (int) config('school.login_max_attempts'));
    }

    public function hit(string $key): void
    {
        RateLimiter::hit($key, (int) config('school.login_lock_minutes') * 60);
    }

    public function clear(string $key): void
    {
        RateLimiter::clear($key);
    }

    public function retryAfterMinutes(string $key): int
    {
        return (int) max(1, ceil(RateLimiter::availableIn($key) / 60));
    }
}