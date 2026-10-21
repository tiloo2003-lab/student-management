<?php

namespace App\Contracts\Services;

use App\Models\User;

interface DashboardServiceInterface
{
    public function forUser(User $user): array;
}