<?php

namespace App\Contracts\Services;

use App\Models\User;
use Illuminate\Support\Collection;

interface StudentPortalServiceInterface
{
    public function courses(User $user): Collection;

    public function grades(User $user): array;

    public function attendance(User $user): array;
}