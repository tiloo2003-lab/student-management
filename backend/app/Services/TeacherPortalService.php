<?php

namespace App\Services;

use App\Contracts\Repositories\AttendanceRepositoryInterface;
use App\Contracts\Repositories\CourseRepositoryInterface;
use App\Contracts\Repositories\EnrollmentRepositoryInterface;
use App\Contracts\Repositories\GradeRepositoryInterface;
use App\Contracts\Repositories\SemesterRepositoryInterface;
use App\Contracts\Repositories\TeacherRepositoryInterface;
use App\Contracts\Services\TeacherPortalServiceInterface;
use App\Contracts\Support\TransactionInterface;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Grade;
use App\Models\User;
use App\Support\GradeCalculator;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class TeacherPortalService implements TeacherPortalServiceInterface
{
    public function __construct(
        private CourseRepositoryInterface $courses,
        private EnrollmentRepositoryInterface $enrollments,
        private GradeRepositoryInterface $grades,
        private AttendanceRepositoryInterface $attendances,
        private TeacherRepositoryInterface $teachers,
        private SemesterRepositoryInterface $semesters,
        private TransactionInterface $transaction,
    ) {
    }

    public function courses(User $user, ?int $semesterId): Collection
    {
        $teacherId = $user->role === 'teacher' ? $this->teacherIdOf($user) : null;

        return $this->courses->forPortal($teacherId, $semesterId);
    }

    public function course(User $user, Course $course): array
    {
        $this->ensureOwns($user, $course);

        $summary = $this->attendances->courseSummary($course->id);
        $students = $this->enrollments->forCourse($course->id)
            ->sortBy(fn ($e) => $e->student->student_code)
            ->values()
            ->map(fn ($e) => $e->toArray() + ['attendance' => $this->attendanceInfo($e->student_id, $summary)]);

        return [
            'course' => $this->courses->loadDetails($course),
            'students' => $students,
            'locked' => $this->isLockedFor($user, $course),
            'rules' => [
                'grade_lock_days' => (int) config('school.grade_lock_days'),
                'absence_ratio_limit' => (float) config('school.absence_ratio_limit'),
                'min_sessions_for_ban' => (int) config('school.min_sessions_for_ban'),
            ],
        ];
    }

    public function updateGrade(User $user, Enrollment $enrollment, ?float $midterm, ?float $final): Grade
    {
        $course = $this->enrollments->withCourse($enrollment)->course;

        $this->ensureOwns($user, $course);
        $this->ensureNotLocked($user, $course);

        if ($final !== null && $midterm === null) {
            throw new UnprocessableEntityHttpException('Phải nhập điểm giữa kỳ trước khi nhập điểm cuối kỳ.');
        }

        if ($final !== null) {
            $info = $this->attendanceInfo($enrollment->student_id, $this->attendances->courseSummary($course->id));
            if ($info['banned']) {
                $limit = (int) round((float) config('school.absence_ratio_limit') * 100);
                throw new UnprocessableEntityHttpException(
                    "Sinh viên vắng {$info['absent']}/{$info['sessions']} buổi (quá {$limit}%), bị cấm thi nên không thể nhập điểm cuối kỳ."
                );
            }
        }

        $midterm = $midterm !== null ? round($midterm, 2) : null;
        $final = $final !== null ? round($final, 2) : null;
        $total = GradeCalculator::total($midterm, $final);

        return $this->grades->upsert($enrollment->id, [
            'midterm' => $midterm,
            'final' => $final,
            'total' => $total,
            'letter' => GradeCalculator::letter($total),
        ]);
    }

    public function attendance(User $user, Course $course, string $date): Collection
    {
        $this->ensureOwns($user, $course);

        $records = $this->attendances->forCourseOnDate($course->id, $date)->keyBy('student_id');

        return $this->enrollments->forCourseWithNames($course->id)
            ->map(fn ($e) => [
                'student_id' => $e->student_id,
                'student_code' => $e->student->student_code,
                'name' => $e->student->user->name,
                'status' => $records[$e->student_id]->status ?? null,
                'note' => $records[$e->student_id]->note ?? null,
            ])
            ->sortBy('student_code')
            ->values();
    }

    public function saveAttendance(User $user, Course $course, string $date, array $records): void
    {
        $this->ensureOwns($user, $course);
        $this->ensureNotLocked($user, $course);
        $this->assertDateInSemester($course, $date);

        $valid = $this->enrollments->studentIdsForCourse($course->id);

        $this->transaction->run(function () use ($course, $date, $records, $valid) {
            foreach ($records as $record) {
                if (! in_array($record['student_id'], $valid)) {
                    continue;
                }
                $this->attendances->record($course->id, $record['student_id'], $date, $record['status'], $record['note'] ?? null);
            }
        });
    }

    private function attendanceInfo(int $studentId, array $summary): array
    {
        $counts = $summary['students'][$studentId] ?? [];
        $sessions = (int) $summary['sessions'];
        $absent = $counts['absent'] ?? 0;
        $ratio = $sessions > 0 ? $absent / $sessions : 0.0;

        return [
            'sessions' => $sessions,
            'absent' => $absent,
            'late' => $counts['late'] ?? 0,
            'excused' => $counts['excused'] ?? 0,
            'ratio' => round($ratio, 2),
            'banned' => $sessions >= (int) config('school.min_sessions_for_ban')
                && $ratio > (float) config('school.absence_ratio_limit'),
        ];
    }

    private function assertDateInSemester(Course $course, string $date): void
    {
        $semester = $this->semesters->findOrFail($course->semester_id);
        $day = Carbon::parse($date)->startOfDay();

        if ($day->greaterThan(now()->endOfDay())) {
            throw new UnprocessableEntityHttpException('Không thể điểm danh cho ngày trong tương lai.');
        }
        if ($day->lessThan($semester->start_date->copy()->startOfDay()) || $day->greaterThan($semester->end_date->copy()->endOfDay())) {
            throw new UnprocessableEntityHttpException('Ngày điểm danh nằm ngoài thời gian của học kỳ.');
        }
    }

    private function isLockedFor(User $user, Course $course): bool
    {
        if ($user->role !== 'teacher') {
            return false;
        }

        $semester = $this->semesters->findOrFail($course->semester_id);
        $lockAt = $semester->end_date->copy()->addDays((int) config('school.grade_lock_days'))->endOfDay();

        return now()->greaterThan($lockAt);
    }

    private function ensureNotLocked(User $user, Course $course): void
    {
        if ($this->isLockedFor($user, $course)) {
            $days = (int) config('school.grade_lock_days');
            throw new AccessDeniedHttpException("Dữ liệu đã bị khóa vì học kỳ kết thúc quá {$days} ngày. Vui lòng liên hệ quản trị viên.");
        }
    }

    private function teacherIdOf(User $user): ?int
    {
        return $this->teachers->findByUserId($user->id)?->id;
    }

    private function ensureOwns(User $user, Course $course): void
    {
        if ($user->role !== 'teacher') {
            return;
        }

        if ($course->teacher_id !== $this->teacherIdOf($user)) {
            throw new AccessDeniedHttpException('Bạn không phụ trách lớp học phần này.');
        }
    }
}
