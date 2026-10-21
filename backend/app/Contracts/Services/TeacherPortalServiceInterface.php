<?php

namespace App\Contracts\Services;

use App\Models\Course;
use App\Models\User;
use Illuminate\Support\Collection;

interface TeacherPortalServiceInterface
{
    public function courses(User $user, ?int $semesterId): Collection;

    public function course(User $user, Course $course): array;

    public function saveGrades(User $user, Course $course, array $rows): array;

    public function attendance(User $user, Course $course, string $date): Collection;

    public function saveAttendance(User $user, Course $course, string $date, array $records): void;
}
