<?php

namespace App\Contracts\Repositories;

use App\Models\Enrollment;
use Illuminate\Database\Eloquent\Collection;

interface EnrollmentRepositoryInterface extends BaseRepositoryInterface
{
    public function withCourse(Enrollment $enrollment): Enrollment;

    public function forCourse(int $courseId): Collection;

    public function forCourseWithNames(int $courseId): Collection;

    public function forStudent(int $studentId): Collection;

    public function exists(int $courseId, int $studentId): bool;

    public function countForCourse(int $courseId): int;

    public function studentIdsForCourse(int $courseId): array;

    public function countDistinctStudents(array $courseIds): int;

    public function forSemester(int $semesterId): Collection;

    public function countGradedForCourse(int $courseId): int;

    public function countGradedForStudent(int $studentId): int;

    public function findForStudentAndCourse(int $studentId, int $courseId): ?Enrollment;
}