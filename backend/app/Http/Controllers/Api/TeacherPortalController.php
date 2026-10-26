<?php

namespace App\Http\Controllers\Api;

use App\Contracts\Services\TeacherPortalServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\AttendanceDateRequest;
use App\Http\Requests\SaveAttendanceRequest;
use App\Http\Requests\SaveGradesRequest;
use App\Models\Course;
use Illuminate\Http\Request;

class TeacherPortalController extends Controller
{
    public function __construct(private TeacherPortalServiceInterface $portal)
    {
    }

    public function courses(Request $request)
    {
        $semesterId = $request->filled('semester_id') ? (int) $request->query('semester_id') : null;

        return $this->portal->courses($request->user(), $semesterId);
    }

    public function show(Request $request, Course $course)
    {
        return $this->portal->course($request->user(), $course);
    }

    public function saveGrades(SaveGradesRequest $request, Course $course)
    {
        $rows = array_map(fn ($row) => [
            'enrollment_id' => (int) $row['enrollment_id'],
            'midterm' => isset($row['midterm']) ? (float) $row['midterm'] : null,
            'final' => isset($row['final']) ? (float) $row['final'] : null,
        ], $request->validated('grades'));

        return $this->portal->saveGrades($request->user(), $course, $rows);
    }

    public function attendance(AttendanceDateRequest $request, Course $course)
    {
        return $this->portal->attendance($request->user(), $course, $request->validated('date'));
    }

    public function saveAttendance(SaveAttendanceRequest $request, Course $course)
    {
        $this->portal->saveAttendance($request->user(), $course, $request->validated('date'), $request->validated('records'));

        return ['message' => 'Attendance saved.'];
    }
}
