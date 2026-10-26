<?php

namespace App\Http\Controllers\Api;

use App\Contracts\Services\RegistrationServiceInterface;
use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RegistrationController extends Controller
{
    public function __construct(private RegistrationServiceInterface $registration)
    {
    }

    public function index(Request $request)
    {
        return $this->registration->available($request->user());
    }

    public function store(Request $request, Course $course): JsonResponse
    {
        $this->registration->register($request->user(), $course);

        return response()->json(['message' => 'Course registration successful.'], 201);
    }

    public function destroy(Request $request, Course $course): JsonResponse
    {
        $this->registration->cancel($request->user(), $course);

        return response()->json(['message' => 'Course registration cancelled.']);
    }
}
