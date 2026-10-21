<?php

namespace App\Repositories;

use App\Contracts\Repositories\EnrollmentRepositoryInterface;
use App\Models\Enrollment;
use Illuminate\Database\Eloquent\Collection;

class EnrollmentRepository extends BaseRepository implements EnrollmentRepositoryInterface
{
    protected string $model = Enrollment::class;

    public function withCourse(Enrollment $enrollment): Enrollment
    {
        return $enrollment->load('course');
    }

    public function forCourse(int $courseId): Collection
    {
        return Enrollment::with(['student.user:id,name,email', 'student.schoolClass:id,code', 'grade'])
            ->where('course_id', $courseId)
            ->get();
    }

    public function forCourseWithNames(int $courseId): Collection
    {
        return Enrollment::with('student.user:id,name')->where('course_id', $courseId)->get();
    }

    public function forStudent(int $studentId): Collection
    {
        return Enrollment::with([
            'course.subject:id,code,name,credits',
            'course.semester:id,name,is_current',
            'course.teacher',
            'grade',
        ])->where('student_id', $studentId)->get();
    }

    public function exists(int $courseId, int $studentId): bool
    {
        return Enrollment::where('course_id', $courseId)->where('student_id', $studentId)->exists();
    }

    public function countForCourse(int $courseId): int
    {
        return Enrollment::where('course_id', $courseId)->count();
    }

    public function studentIdsForCourse(int $courseId): array
    {
        return Enrollment::where('course_id', $courseId)->pluck('student_id')->all();
    }

    public function countDistinctStudents(array $courseIds): int
    {
        return Enrollment::whereIn('course_id', $courseIds)->distinct('student_id')->count('student_id');
    }

    public function forSemester(int $semesterId): Collection
    {
        return Enrollment::with([
            'student.user:id,name',
            'student.schoolClass:id,code',
            'course.subject:id,code,name,credits',
            'course.teacher',
            'grade',
        ])->whereHas('course', fn ($q) => $q->where('semester_id', $semesterId))->get();
    }

    public function countGradedForCourse(int $courseId): int
    {
        return Enrollment::where('course_id', $courseId)
            ->whereHas('grade', fn ($q) => $q->where(fn ($w) => $w->whereNotNull('midterm')->orWhereNotNull('final')))
            ->count();
    }

    public function countGradedForStudent(int $studentId): int
    {
        return Enrollment::where('student_id', $studentId)
            ->whereHas('grade', fn ($q) => $q->where(fn ($w) => $w->whereNotNull('midterm')->orWhereNotNull('final')))
            ->count();
    }

    public function findForStudentAndCourse(int $studentId, int $courseId): ?Enrollment
    {
        return Enrollment::with('grade')->where('student_id', $studentId)->where('course_id', $courseId)->first();
    }
}
