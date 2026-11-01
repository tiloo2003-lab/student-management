<?php

namespace App\Services;

use App\Contracts\Repositories\AnnouncementRepositoryInterface;
use App\Contracts\Repositories\AttendanceRepositoryInterface;
use App\Contracts\Repositories\CourseRepositoryInterface;
use App\Contracts\Repositories\DepartmentRepositoryInterface;
use App\Contracts\Repositories\EnrollmentRepositoryInterface;
use App\Contracts\Repositories\GradeRepositoryInterface;
use App\Contracts\Repositories\PostRepositoryInterface;
use App\Contracts\Repositories\SchoolClassRepositoryInterface;
use App\Contracts\Repositories\SemesterRepositoryInterface;
use App\Contracts\Repositories\StudentRepositoryInterface;
use App\Contracts\Repositories\SubjectRepositoryInterface;
use App\Contracts\Repositories\TeacherRepositoryInterface;
use App\Contracts\Services\AcademicServiceInterface;
use App\Contracts\Services\DashboardServiceInterface;
use App\Models\User;

class DashboardService implements DashboardServiceInterface
{
    public function __construct(
        private StudentRepositoryInterface $students,
        private TeacherRepositoryInterface $teachers,
        private SchoolClassRepositoryInterface $classes,
        private DepartmentRepositoryInterface $departments,
        private SubjectRepositoryInterface $subjects,
        private CourseRepositoryInterface $courses,
        private PostRepositoryInterface $posts,
        private SemesterRepositoryInterface $semesters,
        private GradeRepositoryInterface $grades,
        private EnrollmentRepositoryInterface $enrollments,
        private AttendanceRepositoryInterface $attendances,
        private AnnouncementRepositoryInterface $announcements,
        private AcademicServiceInterface $academic,
    ) {
    }

    public function forUser(User $user): array
    {
        $data = match ($user->role) {
            'admin' => $this->admin(),
            'teacher' => $this->teacher($user),
            default => $this->student($user),
        };

        return ['role' => $user->role]
            + $data
            + ['announcements' => $this->announcements->recentForRole($user->role, 5)];
    }

    private function admin(): array
    {
        return [
            'counts' => [
                'students' => $this->students->count(),
                'teachers' => $this->teachers->count(),
                'classes' => $this->classes->count(),
                'departments' => $this->departments->count(),
                'subjects' => $this->subjects->count(),
                'courses' => $this->courses->count(),
                'posts' => $this->posts->count(),
            ],
            'current_semester' => $this->semesters->current(),
            'students_by_department' => $this->students->countByDepartment(8),
            'grade_distribution' => $this->grades->distribution(),
            'gender' => $this->students->countByGender(),
        ];
    }

    private function teacher(User $user): array
    {
        $teacherId = $this->teachers->findByUserId($user->id)->id;
        $courses = $this->courses->forPortal($teacherId);
        $current = $courses->filter(fn ($c) => $c->semester?->is_current)->values();

        return [
            'counts' => [
                'courses' => $courses->count(),
                'current_courses' => $current->count(),
                'students' => $this->enrollments->countDistinctStudents($courses->pluck('id')->all()),
                'homeroom_classes' => $this->classes->countByHomeroomTeacher($teacherId),
            ],
            'current_courses' => $current,
        ];
    }

    private function student(User $user): array
    {
        $student = $this->students->findByUserId($user->id);
        $studentId = $student->id;
        $class = $this->classes->find($student->class_id);
        $enrollments = $this->enrollments->forStudent($studentId);
        $transcript = $this->academic->transcript($studentId);
        $cumulative = $transcript['cumulative'];

        $attendances = $this->attendances->forStudent($studentId);
        $attended = $attendances->whereIn('status', ['present', 'late', 'excused'])->count();

        return [
            'counts' => [
                'courses' => $enrollments->count(),
                'credits' => $cumulative['graded_credits'],
                'gpa' => $cumulative['gpa'],
                'attendance_rate' => $attendances->count() ? round($attended * 100 / $attendances->count()) : null,
            ],
            'school_class' => $class ? [
                'code' => $class->code,
                'name' => $class->name,
                'department' => $class->department?->name,
                'academic_year' => $class->academic_year,
                'homeroom_teacher' => $class->homeroomTeacher?->user?->name,
            ] : null,
            'classification' => $cumulative['classification'],
            'standing' => $transcript['standing'],
            'current_courses' => $enrollments->filter(fn ($e) => $e->course->semester?->is_current)->values(),
        ];
    }
}
