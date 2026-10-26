<?php

namespace App\Http\Controllers\Api;

use App\Contracts\Services\CourseServiceInterface;
use App\Http\Requests\AddCourseStudentRequest;
use App\Http\Requests\CourseRequest;
use App\Models\Course;
use App\Models\Enrollment;
use Illuminate\Http\JsonResponse;

class CourseController extends ResourceController
{
    public function __construct(private CourseServiceInterface $courses)
    {
        parent::__construct($courses);
    }

    public function store(CourseRequest $request): JsonResponse
    {
        return $this->storeResource($request->validated());
    }

    public function update(CourseRequest $request, int|string $id)
    {
        return $this->updateResource($id, $request->validated());
    }

    public function students(Course $course)
    {
        return $this->courses->students($course);
    }

    public function addStudent(AddCourseStudentRequest $request, Course $course): JsonResponse
    {
        $this->courses->addStudent($course, (int) $request->validated('student_id'));

        return response()->json(['message' => 'Student added.'], 201);
    }

    public function removeStudent(Course $course, Enrollment $enrollment): JsonResponse
    {
        $this->courses->removeStudent($course, $enrollment);

        return response()->json(['message' => 'Student removed from the course section.']);
    }
}
