<?php

namespace App\Contracts\Support;

interface LoginThrottleInterface
{
    public function isLocked(string $key): bool;

    public function hit(string $key): void;

    public function clear(string $key): void;

    public function retryAfterMinutes(string $key): int;
}