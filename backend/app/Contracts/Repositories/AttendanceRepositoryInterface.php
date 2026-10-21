<?php

namespace App\Contracts\Repositories;

use Illuminate\Database\Eloquent\Collection;

interface AttendanceRepositoryInterface extends BaseRepositoryInterface
{
    public function forCourseOnDate(int $courseId, string $date): Collection;

    public function record(int $courseId, int $studentId, string $date, string $status, ?string $note): void;

    public function forStudent(int $studentId): Collection;

    public function courseSummary(int $courseId): array;
}