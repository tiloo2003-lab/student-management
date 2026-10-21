<?php

namespace App\Http\Controllers\Api;

use App\Contracts\Services\ReportServiceInterface;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function overview(Request $request, ReportServiceInterface $reports)
    {
        $semesterId = $request->filled('semester_id') ? (int) $request->query('semester_id') : null;

        $classId = $request->filled('class_id') ? (int) $request->query('class_id') : null;

        return $reports->overview($semesterId, $classId);
    }
}
