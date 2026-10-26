<?php

namespace App\Services;

use App\Contracts\Repositories\CourseRepositoryInterface;
use App\Contracts\Repositories\EnrollmentRepositoryInterface;
use App\Contracts\Repositories\GradeRepositoryInterface;
use App\Contracts\Services\EnrollmentServiceInterface;
use App\Contracts\Support\TransactionInterface;
use App\Models\Course;
use App\Models\Enrollment;
use App\Support\GradeCalculator;
use App\Support\Schedule;
use Illuminate\Support\Collection;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class EnrollmentService implements EnrollmentServiceInterface
{
    public function __construct(
        private EnrollmentRepositoryInterface $enrollments,
        private GradeRepositoryInterface $grades,
        private CourseRepositoryInterface $courses,
        private TransactionInterface $transaction,
    ) {
    }

    public function evaluate(int $studentId, Course $course, ?Collection $history = null): array
    {
        $history ??= $this->enrollments->forStudent($studentId);

        if ($history->contains(fn ($e) => $e->course_id === $course->id)) {
            return ['eligible' => false, 'registered' => true, 'reasons' => ['You are already registered for this course section.']];
        }

        $reasons = [];
        $sameSemester = $history->filter(fn ($e) => $e->course->semester_id === $course->semester_id);

        $enrolled = $course->enrollments_count ?? $this->enrollments->countForCourse($course->id);
        if ($enrolled >= $course->max_students) {
            $reasons[] = 'This course section is full.';
        }

        if ($sameSemester->contains(fn ($e) => $e->course->subject_id === $course->subject_id)) {
            $reasons[] = 'You are already registered for this subject in another section this semester.';
        }

        $passed = $history->first(
            fn ($e) => $e->course->subject_id === $course->subject_id && GradeCalculator::passed($e->grade?->total)
        );
        if ($passed) {
            $reasons[] = "You already passed this subject with a score of {$passed->grade->total} and cannot retake it.";
        }

        $conflict = $sameSemester->first(fn ($e) => Schedule::conflicts($e->course, $course));
        if ($conflict) {
            $reasons[] = "Schedule conflict with section {$conflict->course->code} ({$conflict->course->subject->name}).";
        }

        $max = (int) config('school.max_credits_per_semester');
        $used = (int) $sameSemester->sum(fn ($e) => $e->course->subject->credits);
        if ($used + (int) $course->subject->credits > $max) {
            $reasons[] = "Exceeds the limit of {$max} credits per semester (currently registered: {$used} credits).";
        }

        return ['eligible' => $reasons === [], 'registered' => false, 'reasons' => $reasons];
    }

    public function enroll(int $studentId, Course $course): Enrollment
    {
        $course = $this->courses->findOrFail($course->id);
        $result = $this->evaluate($studentId, $course);

        if (! $result['eligible']) {
            throw new UnprocessableEntityHttpException($result['reasons'][0]);
        }

        return $this->transaction->run(function () use ($studentId, $course) {
            $enrollment = $this->enrollments->create([
                'student_id' => $studentId,
                'course_id' => $course->id,
                'enrolled_at' => now()->toDateString(),
            ]);
            $this->grades->create(['enrollment_id' => $enrollment->id]);

            return $enrollment;
        });
    }
}
