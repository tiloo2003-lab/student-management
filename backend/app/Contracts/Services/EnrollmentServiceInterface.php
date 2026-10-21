<?php

namespace App\Contracts\Services;

use App\Models\Course;
use App\Models\Enrollment;
use Illuminate\Support\Collection;

interface EnrollmentServiceInterface
{
    public function evaluate(int $studentId, Course $course, ?Collection $history = null): array;

    public function enroll(int $studentId, Course $course): Enrollment;
}