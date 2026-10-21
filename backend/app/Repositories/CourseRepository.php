<?php

namespace App\Repositories;

use App\Contracts\Repositories\CourseRepositoryInterface;
use App\Models\Course;
use Illuminate\Database\Eloquent\Collection;

class CourseRepository extends BaseRepository implements CourseRepositoryInterface
{
    protected string $model = Course::class;

    protected array $with = ['subject:id,code,name,credits', 'teacher', 'semester:id,name,is_current'];

    protected array $withCount = ['enrollments'];

    protected array $searchable = ['code', 'subject.name'];

    protected array $filterable = ['semester_id', 'teacher_id', 'subject_id'];

    protected array $relationFilters = [
        'academic_year' => 'semester.academic_year',
        'department_id' => 'subject.department_id',
    ];

    public function forPortal(?int $teacherId = null, ?int $semesterId = null): Collection
    {
        return Course::with(['subject:id,code,name,credits', 'semester:id,name,is_current'])
            ->withCount('enrollments')
            ->when($teacherId, fn ($q) => $q->where('teacher_id', $teacherId))
            ->when($semesterId, fn ($q) => $q->where('semester_id', $semesterId))
            ->orderByDesc('semester_id')
            ->orderBy('code')
            ->get();
    }

    public function loadDetails(Course $course): Course
    {
        return $course->load(['subject:id,code,name,credits', 'semester:id,name,is_current', 'teacher']);
    }

    public function forTeacherInSemester(int $teacherId, int $semesterId, ?int $exceptId = null): Collection
    {
        return Course::with('subject:id,code,name,credits')
            ->where('teacher_id', $teacherId)
            ->where('semester_id', $semesterId)
            ->when($exceptId, fn ($q) => $q->where('id', '!=', $exceptId))
            ->get();
    }

    public function forRoomInSemester(string $room, int $semesterId, ?int $exceptId = null): Collection
    {
        return Course::with('subject:id,code,name,credits')
            ->where('room', $room)
            ->where('semester_id', $semesterId)
            ->when($exceptId, fn ($q) => $q->where('id', '!=', $exceptId))
            ->get();
    }

    public function countInSemester(int $semesterId): int
    {
        return Course::where('semester_id', $semesterId)->count();
    }
}
