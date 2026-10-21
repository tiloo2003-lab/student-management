<?php

namespace App\Contracts\Services;

use App\Models\Course;
use App\Models\User;

interface ExportServiceInterface
{
    public function studentTranscript(User $user, array $filters): array;

    public function studentTranscriptById(int $studentId, array $filters): array;

    public function courseGradeSheet(User $user, Course $course): array;

    public function report(?int $semesterId, ?int $classId): array;
}
