<?php

namespace App\Contracts\Repositories;

use App\Models\Course;
use Illuminate\Database\Eloquent\Collection;

interface CourseRepositoryInterface extends BaseRepositoryInterface
{
    public function forPortal(?int $teacherId = null, ?int $semesterId = null): Collection;

    public function loadDetails(Course $course): Course;

    public function forTeacherInSemester(int $teacherId, int $semesterId, ?int $exceptId = null): Collection;

    public function forRoomInSemester(string $room, int $semesterId, ?int $exceptId = null): Collection;

    public function countInSemester(int $semesterId): int;
}