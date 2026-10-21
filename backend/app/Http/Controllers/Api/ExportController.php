<?php

namespace App\Http\Controllers\Api;

use App\Contracts\Services\ExportServiceInterface;
use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ExportController extends Controller
{
    public function __construct(private ExportServiceInterface $exports)
    {
    }

    public function myTranscript(Request $request): Response
    {
        return $this->pdf($this->exports->studentTranscript($request->user(), $this->filters($request)));
    }

    public function studentTranscript(Request $request, int $student): Response
    {
        return $this->pdf($this->exports->studentTranscriptById($student, $this->filters($request)));
    }

    public function courseGradeSheet(Request $request, Course $course): Response
    {
        return $this->pdf($this->exports->courseGradeSheet($request->user(), $course));
    }

    public function report(Request $request): Response
    {
        $semesterId = $request->filled('semester_id') ? (int) $request->query('semester_id') : null;
        $classId = $request->filled('class_id') ? (int) $request->query('class_id') : null;

        return $this->pdf($this->exports->report($semesterId, $classId));
    }

    private function filters(Request $request): array
    {
        return $request->only(['academic_year', 'semester_id', 'subject_id']);
    }

    private function pdf(array $file): Response
    {
        return response($file['content'], 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="' . $file['filename'] . '"',
            'Access-Control-Expose-Headers' => 'Content-Disposition',
        ]);
    }
}
