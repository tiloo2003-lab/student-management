<?php

namespace App\Services;

use App\Contracts\Repositories\EnrollmentRepositoryInterface;
use App\Contracts\Repositories\SchoolClassRepositoryInterface;
use App\Contracts\Repositories\SemesterRepositoryInterface;
use App\Contracts\Services\ReportServiceInterface;
use App\Support\GradeCalculator;
use Illuminate\Support\Collection;

class ReportService implements ReportServiceInterface
{
    public function __construct(
        private SemesterRepositoryInterface $semesters,
        private EnrollmentRepositoryInterface $enrollments,
        private SchoolClassRepositoryInterface $classes,
    ) {
    }

    public function overview(?int $semesterId, ?int $classId = null): array
    {
        $all = $this->semesters->all();
        $semester = $semesterId
            ? $this->semesters->findOrFail($semesterId)
            : ($this->semesters->current() ?? $all->first());

        $base = [
            'semesters' => $all->map(fn ($s) => $s->only(['id', 'name', 'academic_year', 'is_current']))->values(),
            'class_options' => $this->classes->all()->sortBy('code')->map(fn ($c) => $c->only(['id', 'code', 'name']))->values(),
        ];

        if (! $semester) {
            return $base + ['semester' => null];
        }

        $items = $this->enrollments->forSemester($semester->id)
            ->when($classId, fn ($c) => $c->filter(fn ($e) => (int) $e->student->class_id === $classId))
            ->values();
        $graded = $items->filter(fn ($e) => $e->grade?->total !== null);
        $students = $this->studentRows($items);

        $warningGpa = (float) config('school.warning_gpa');
        $minGpa = (float) config('school.scholarship_min_gpa');
        $minCredits = (int) config('school.scholarship_min_credits');

        return $base + [
            'semester' => $semester->only(['id', 'name', 'academic_year', 'is_current']),
            'class_id' => $classId,
            'summary' => [
                'enrollments' => $items->count(),
                'graded' => $graded->count(),
                'students' => $items->pluck('student_id')->unique()->count(),
                'average' => $graded->isEmpty() ? null : round($graded->avg(fn ($e) => $e->grade->total), 2),
                'pass_rate' => $this->passRate($graded),
            ],
            'letters' => $graded->groupBy(fn ($e) => $e->grade->letter)
                ->map(fn ($g, $letter) => ['label' => $letter, 'total' => $g->count()])
                ->sortBy('label')->values(),
            'courses' => $this->courseRows($items),
            'classes' => $this->classRows($students),
            'warnings' => $students->filter(fn ($s) => $s['gpa'] < $warningGpa)->sortBy('gpa')->values(),
            'scholarships' => $students
                ->filter(fn ($s) => $s['gpa'] >= $minGpa && $s['credits_failed'] === 0 && $s['credits'] >= $minCredits)
                ->sortByDesc('gpa')->values(),
            'top_students' => $students->sortByDesc('gpa')->take(10)->values(),
        ];
    }

    private function passRate(Collection $graded): ?float
    {
        if ($graded->isEmpty()) {
            return null;
        }

        return round($graded->filter(fn ($e) => GradeCalculator::passed($e->grade->total))->count() * 100 / $graded->count(), 1);
    }

    private function courseRows(Collection $items): Collection
    {
        return $items->groupBy('course_id')->map(function ($group) {
            $course = $group->first()->course;
            $graded = $group->filter(fn ($e) => $e->grade?->total !== null);

            return [
                'code' => $course->code,
                'subject' => $course->subject->name,
                'teacher' => $course->teacher?->user?->name,
                'enrolled' => $group->count(),
                'graded' => $graded->count(),
                'average' => $graded->isEmpty() ? null : round($graded->avg(fn ($e) => $e->grade->total), 2),
                'pass_rate' => $this->passRate($graded),
            ];
        })->sortBy('code')->values();
    }

    private function studentRows(Collection $items): Collection
    {
        return $items->groupBy('student_id')->map(function ($group) {
            $student = $group->first()->student;
            $summary = GradeCalculator::summarize($group);

            return [
                'student_id' => $student->id,
                'student_code' => $student->student_code,
                'name' => $student->user?->name,
                'class' => $student->schoolClass?->code,
                'gpa' => $summary['gpa'],
                'credits' => $summary['credits'],
                'credits_failed' => $summary['credits_failed'],
            ];
        })->filter(fn ($s) => $s['gpa'] !== null)->values();
    }

    private function classRows(Collection $students): Collection
    {
        return $students->groupBy('class')->map(fn ($group, $class) => [
            'class' => $class,
            'students' => $group->count(),
            'average_gpa' => round($group->avg('gpa'), 2),
        ])->sortByDesc('average_gpa')->values();
    }
}
