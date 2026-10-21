<?php

namespace App\Http\Controllers\Api;

use App\Contracts\Services\StudentPortalServiceInterface;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class StudentPortalController extends Controller
{
    public function __construct(private StudentPortalServiceInterface $portal)
    {
    }

    public function courses(Request $request)
    {
        return $this->portal->courses($request->user());
    }

    public function grades(Request $request)
    {
        return $this->portal->grades($request->user(), $request->only(['academic_year', 'semester_id', 'subject_id']));
    }

    public function attendance(Request $request)
    {
        return $this->portal->attendance($request->user());
    }
}
