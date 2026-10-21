<?php

namespace App\Services;

use App\Contracts\Repositories\EnrollmentRepositoryInterface;
use App\Contracts\Services\AcademicServiceInterface;
use App\Support\GradeCalculator;

class AcademicService implements AcademicServiceInterface
{
    public function __construct(private EnrollmentRepositoryInterface $enrollments)
    {
    }

    public function transcript(int $studentId): array
    {
        $items = $this->enrollments->forStudent($studentId);

        $semesters = $items
            ->groupBy(fn ($e) => $e->course->semester_id)
            ->map(function ($group) {
                $semester = $group->first()->course->semester;
                $summary = GradeCalculator::summarize($group);

                return [
                    'semester' => $semester->only(['id', 'name', 'is_current']),
                    'registered_credits' => (int) $group->sum(fn ($e) => $e->course->subject->credits),
                    'graded_credits' => $summary['credits'],
                    'credits_earned' => $summary['credits_earned'],
                    'credits_failed' => $summary['credits_failed'],
                    'gpa' => $summary['gpa'],
                    'gpa4' => $summary['gpa4'],
                    'classification' => GradeCalculator::classification($summary['gpa']),
                    'courses' => $group->map(fn ($e) => [
                        'id' => $e->id,
                        'code' => $e->course->code,
                        'name' => $e->course->subject->name,
                        'credits' => $e->course->subject->credits,
                        'midterm' => $e->grade?->midterm,
                        'final' => $e->grade?->final,
                        'total' => $e->grade?->total,
                        'letter' => $e->grade?->letter,
                        'passed' => $e->grade?->total !== null ? GradeCalculator::passed($e->grade->total) : null,
                    ])->values(),
                ];
            })
            ->sortByDesc(fn ($s) => $s['semester']['id'])
            ->values();

        $summary = GradeCalculator::summarize($items);

        return [
            'semesters' => $semesters,
            'cumulative' => [
                'gpa' => $summary['gpa'],
                'gpa4' => $summary['gpa4'],
                'graded_credits' => $summary['credits'],
                'credits_earned' => $summary['credits_earned'],
                'credits_failed' => $summary['credits_failed'],
                'classification' => GradeCalculator::classification($summary['gpa']),
            ],
            'standing' => $this->standing($semesters->first(fn ($s) => $s['graded_credits'] > 0)),
        ];
    }

    private function standing(?array $last): array
    {
        if (! $last) {
            return ['warning' => null, 'scholarship' => null];
        }

        $name = $last['semester']['name'];
        $warningGpa = (float) config('school.warning_gpa');
        $minGpa = (float) config('school.scholarship_min_gpa');
        $minCredits = (int) config('school.scholarship_min_credits');

        $warning = $last['gpa'] < $warningGpa
            ? "Cảnh báo học vụ: điểm trung bình {$name} là {$last['gpa']}, dưới ngưỡng {$warningGpa}."
            : null;

        $eligible = $last['gpa'] >= $minGpa && $last['credits_failed'] === 0 && $last['graded_credits'] >= $minCredits;
        $scholarship = $eligible
            ? "Đủ điều kiện xét học bổng khuyến khích học tập ({$name}): điểm trung bình {$last['gpa']}, không có môn không đạt."
            : null;

        return ['warning' => $warning, 'scholarship' => $scholarship];
    }
}
