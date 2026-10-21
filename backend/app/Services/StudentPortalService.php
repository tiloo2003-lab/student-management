<?php

namespace App\Services;

use App\Contracts\Repositories\AttendanceRepositoryInterface;
use App\Contracts\Repositories\EnrollmentRepositoryInterface;
use App\Contracts\Repositories\StudentRepositoryInterface;
use App\Contracts\Services\AcademicServiceInterface;
use App\Contracts\Services\StudentPortalServiceInterface;
use App\Models\User;
use Illuminate\Support\Collection;

class StudentPortalService implements StudentPortalServiceInterface
{
    public function __construct(
        private EnrollmentRepositoryInterface $enrollments,
        private AttendanceRepositoryInterface $attendances,
        private StudentRepositoryInterface $students,
        private AcademicServiceInterface $academic,
    ) {
    }

    public function courses(User $user): Collection
    {
        return $this->enrollments->forStudent($this->studentIdOf($user))
            ->sortByDesc(fn ($e) => $e->course->semester_id)
            ->values();
    }

    public function grades(User $user): array
    {
        $studentId = $this->studentIdOf($user);
        $transcript = $this->academic->transcript($studentId);
        $cumulative = $transcript['cumulative'];

        return [
            'gpa' => $cumulative['gpa'],
            'gpa4' => $cumulative['gpa4'],
            'credits' => $cumulative['graded_credits'],
            'credits_earned' => $cumulative['credits_earned'],
            'credits_failed' => $cumulative['credits_failed'],
            'classification' => $cumulative['classification'],
            'standing' => $transcript['standing'],
            'semesters' => $transcript['semesters'],
            'items' => $this->courses($user),
        ];
    }

    public function attendance(User $user): array
    {
        $items = $this->attendances->forStudent($this->studentIdOf($user));

        return [
            'summary' => [
                'total' => $items->count(),
                'present' => $items->where('status', 'present')->count(),
                'late' => $items->where('status', 'late')->count(),
                'absent' => $items->where('status', 'absent')->count(),
                'excused' => $items->where('status', 'excused')->count(),
            ],
            'items' => $items,
        ];
    }

    private function studentIdOf(User $user): int
    {
        return $this->students->findByUserId($user->id)->id;
    }
}
