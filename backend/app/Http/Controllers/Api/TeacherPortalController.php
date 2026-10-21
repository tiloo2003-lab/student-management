<?php

namespace App\Http\Controllers\Api;

use App\Contracts\Services\TeacherPortalServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\AttendanceDateRequest;
use App\Http\Requests\SaveAttendanceRequest;
use App\Http\Requests\UpdateGradeRequest;
use App\Models\Course;
use App\Models\Enrollment;
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

    public function updateGrade(UpdateGradeRequest $request, Enrollment $enrollment)
    {
        $midterm = $request->validated('midterm');
        $final = $request->validated('final');

        return $this->portal->updateGrade(
            $request->user(),
            $enrollment,
            $midterm !== null ? (float) $midterm : null,
            $final !== null ? (float) $final : null
        );
    }

    public function attendance(AttendanceDateRequest $request, Course $course)
    {
        return $this->portal->attendance($request->user(), $course, $request->validated('date'));
    }

    public function saveAttendance(SaveAttendanceRequest $request, Course $course)
    {
        $this->portal->saveAttendance($request->user(), $course, $request->validated('date'), $request->validated('records'));

        return ['message' => 'Đã lưu điểm danh.'];
    }
}
