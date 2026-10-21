<?php

namespace App\Services;

use App\Contracts\Repositories\CourseRepositoryInterface;
use App\Contracts\Repositories\EnrollmentRepositoryInterface;
use App\Contracts\Repositories\SemesterRepositoryInterface;
use App\Contracts\Repositories\StudentRepositoryInterface;
use App\Contracts\Services\EnrollmentServiceInterface;
use App\Contracts\Services\RegistrationServiceInterface;
use App\Models\Course;
use App\Models\Student;
use App\Models\User;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class RegistrationService implements RegistrationServiceInterface
{
    public function __construct(
        private StudentRepositoryInterface $students,
        private CourseRepositoryInterface $courses,
        private EnrollmentRepositoryInterface $enrollments,
        private SemesterRepositoryInterface $semesters,
        private EnrollmentServiceInterface $enrollmentService,
    ) {
    }

    public function available(User $user): array
    {
        $student = $this->studentOf($user);
        $semester = $this->semesters->current();
        $max = (int) config('school.max_credits_per_semester');

        if (! $semester) {
            return ['semester' => null, 'max_credits' => $max, 'credits' => 0, 'courses' => []];
        }

        $history = $this->enrollments->forStudent($student->id);
        $mine = $history->filter(fn ($e) => $e->course->semester_id === $semester->id);

        $courses = $this->courses->all(['semester_id' => $semester->id])
            ->sortBy('code')
            ->values()
            ->map(function (Course $course) use ($student, $history, $mine) {
                $enrollment = $mine->first(fn ($e) => $e->course_id === $course->id);

                return $course->toArray() + [
                    'registration' => $this->enrollmentService->evaluate($student->id, $course, $history),
                    'can_cancel' => $enrollment !== null
                        && $enrollment->grade?->midterm === null
                        && $enrollment->grade?->final === null,
                ];
            });

        return [
            'semester' => $semester,
            'max_credits' => $max,
            'credits' => (int) $mine->sum(fn ($e) => $e->course->subject->credits),
            'courses' => $courses,
        ];
    }

    public function register(User $user, Course $course): void
    {
        $student = $this->studentOf($user);
        $course = $this->courses->findOrFail($course->id);

        if (! $course->semester?->is_current) {
            throw new UnprocessableEntityHttpException('Chỉ được đăng ký lớp học phần thuộc học kỳ hiện tại.');
        }

        $this->enrollmentService->enroll($student->id, $course);
    }

    public function cancel(User $user, Course $course): void
    {
        $student = $this->studentOf($user);
        $enrollment = $this->enrollments->findForStudentAndCourse($student->id, $course->id);

        if (! $enrollment) {
            throw new NotFoundHttpException('Bạn chưa đăng ký lớp học phần này.');
        }

        if (! $this->courses->findOrFail($course->id)->semester?->is_current) {
            throw new UnprocessableEntityHttpException('Không thể hủy đăng ký lớp của học kỳ đã kết thúc.');
        }

        if ($enrollment->grade?->midterm !== null || $enrollment->grade?->final !== null) {
            throw new UnprocessableEntityHttpException('Lớp học phần đã có điểm, không thể hủy đăng ký.');
        }

        $this->enrollments->delete($enrollment);
    }

    private function studentOf(User $user): Student
    {
        return $this->students->findByUserId($user->id)
            ?? throw new NotFoundHttpException('Không tìm thấy hồ sơ sinh viên.');
    }
}
