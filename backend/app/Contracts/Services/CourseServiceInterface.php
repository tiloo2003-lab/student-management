<?php

namespace App\Contracts\Services;

use App\Models\Course;
use App\Models\Enrollment;
use Illuminate\Database\Eloquent\Collection;

interface CourseServiceInterface extends CrudServiceInterface
{
    public function students(Course $course): Collection;

    public function addStudent(Course $course, int $studentId): void;

    public function removeStudent(Course $course, Enrollment $enrollment): void;
}