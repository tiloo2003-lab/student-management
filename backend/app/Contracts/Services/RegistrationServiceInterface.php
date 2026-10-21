<?php

namespace App\Contracts\Services;

use App\Models\Course;
use App\Models\User;

interface RegistrationServiceInterface
{
    public function available(User $user): array;

    public function register(User $user, Course $course): void;

    public function cancel(User $user, Course $course): void;
}