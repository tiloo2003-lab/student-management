<?php

namespace App\Repositories;

use App\Contracts\Repositories\AttendanceRepositoryInterface;
use App\Models\Attendance;
use Illuminate\Database\Eloquent\Collection;

class AttendanceRepository extends BaseRepository implements AttendanceRepositoryInterface
{
    protected string $model = Attendance::class;

    public function forCourseOnDate(int $courseId, string $date): Collection
    {
        return Attendance::where('course_id', $courseId)->whereDate('date', $date)->get();
    }

    public function record(int $courseId, int $studentId, string $date, string $status, ?string $note): void
    {
        Attendance::updateOrCreate(
            ['course_id' => $courseId, 'student_id' => $studentId, 'date' => $date],
            ['status' => $status, 'note' => $note]
        );
    }

    public function forStudent(int $studentId): Collection
    {
        return Attendance::with('course.subject:id,name')
            ->where('student_id', $studentId)
            ->orderByDesc('date')
            ->get();
    }

    public function courseSummary(int $courseId): array
    {
        $rows = Attendance::query()
            ->where('course_id', $courseId)
            ->selectRaw('student_id, status, COUNT(*) as total')
            ->groupBy('student_id', 'status')
            ->toBase()
            ->get();

        $students = [];
        foreach ($rows as $row) {
            $students[$row->student_id][$row->status] = (int) $row->total;
        }

        return [
            'sessions' => Attendance::where('course_id', $courseId)->distinct()->count('date'),
            'students' => $students,
        ];
    }
}
