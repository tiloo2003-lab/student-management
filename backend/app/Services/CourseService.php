<?php

namespace App\Services;

use App\Contracts\Repositories\CourseRepositoryInterface;
use App\Contracts\Repositories\EnrollmentRepositoryInterface;
use App\Contracts\Services\CourseServiceInterface;
use App\Contracts\Services\EnrollmentServiceInterface;
use App\Models\Course;
use App\Models\Enrollment;
use App\Support\Schedule;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class CourseService extends CrudService implements CourseServiceInterface
{
    public function __construct(
        private CourseRepositoryInterface $courses,
        private EnrollmentRepositoryInterface $enrollments,
        private EnrollmentServiceInterface $enrollmentService,
    ) {
        parent::__construct($courses);
    }

    public function create(array $data): Model
    {
        $this->assertScheduleAvailable($data);

        return parent::create($data);
    }

    public function update(int|string $id, array $data): Model
    {
        $course = $this->courses->findOrFail($id);
        $enrolled = $this->enrollments->countForCourse($course->id);

        if ($enrolled > 0) {
            if ((int) $data['subject_id'] !== (int) $course->subject_id || (int) $data['semester_id'] !== (int) $course->semester_id) {
                throw new UnprocessableEntityHttpException('This course section already has enrolled students, so its subject or semester cannot be changed.');
            }
            if ((int) $data['max_students'] < $enrolled) {
                throw new UnprocessableEntityHttpException("Maximum capacity cannot be lower than the number of enrolled students ({$enrolled}).");
            }
        }

        $this->assertScheduleAvailable($data, $course->id);

        return parent::update($id, $data);
    }

    public function delete(int|string $id): void
    {
        $course = $this->courses->findOrFail($id);

        if ($this->enrollments->countGradedForCourse($course->id) > 0) {
            throw new ConflictHttpException('This course section has grades and cannot be deleted.');
        }

        parent::delete($id);
    }

    public function students(Course $course): Collection
    {
        return $this->enrollments->forCourse($course->id);
    }

    public function addStudent(Course $course, int $studentId): void
    {
        $this->enrollmentService->enroll($studentId, $course);
    }

    public function removeStudent(Course $course, Enrollment $enrollment): void
    {
        if ($enrollment->course_id !== $course->id) {
            throw new NotFoundHttpException();
        }

        $enrollment = $this->enrollments->findForStudentAndCourse($enrollment->student_id, $course->id);

        if ($enrollment?->grade?->midterm !== null || $enrollment?->grade?->final !== null) {
            throw new UnprocessableEntityHttpException('This student already has grades in this section and cannot be removed.');
        }

        $this->enrollments->delete($enrollment);
    }

    private function assertScheduleAvailable(array $data, ?int $exceptId = null): void
    {
        $teacherCourses = $this->courses->forTeacherInSemester((int) $data['teacher_id'], (int) $data['semester_id'], $exceptId);

        $limit = (int) config('school.max_courses_per_teacher');
        if ($teacherCourses->count() >= $limit) {
            throw new UnprocessableEntityHttpException("The teacher is already assigned the maximum of {$limit} course sections this semester.");
        }

        $teacherConflict = $teacherCourses->first(fn ($c) => Schedule::conflicts($c, $data));
        if ($teacherConflict) {
            throw new UnprocessableEntityHttpException("The teacher has a schedule conflict with section {$teacherConflict->code}.");
        }

        if (! empty($data['room'])) {
            $roomConflict = $this->courses
                ->forRoomInSemester($data['room'], (int) $data['semester_id'], $exceptId)
                ->first(fn ($c) => Schedule::conflicts($c, $data));

            if ($roomConflict) {
                throw new UnprocessableEntityHttpException("Room {$data['room']} is already used by section {$roomConflict->code} at this time.");
            }
        }
    }
}
