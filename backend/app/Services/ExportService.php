<?php

namespace App\Services;

use App\Contracts\Repositories\StudentRepositoryInterface;
use App\Contracts\Services\AcademicServiceInterface;
use App\Contracts\Services\ExportServiceInterface;
use App\Contracts\Services\ReportServiceInterface;
use App\Contracts\Services\TeacherPortalServiceInterface;
use App\Contracts\Support\PdfRendererInterface;
use App\Models\Course;
use App\Models\Student;
use App\Models\User;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class ExportService implements ExportServiceInterface
{
    public function __construct(
        private PdfRendererInterface $pdf,
        private AcademicServiceInterface $academic,
        private StudentRepositoryInterface $students,
        private TeacherPortalServiceInterface $portal,
        private ReportServiceInterface $reports,
    ) {
    }

    public function studentTranscript(User $user, array $filters): array
    {
        $student = $this->students->findByUserId($user->id)
            ?? throw new NotFoundHttpException('Không tìm thấy hồ sơ sinh viên.');

        return $this->transcriptFor($student->id, $filters);
    }

    public function studentTranscriptById(int $studentId, array $filters): array
    {
        return $this->transcriptFor($studentId, $filters);
    }

    public function courseGradeSheet(User $user, Course $course): array
    {
        $data = $this->portal->course($user, $course);

        return [
            'filename' => 'bang-diem-lop-' . Str::slug($course->code) . '.pdf',
            'content' => $this->pdf->render('pdf.gradesheet', [
                'course' => $data['course'],
                'students' => $data['students'],
                'generatedAt' => now()->format('d/m/Y'),
            ]),
        ];
    }

    public function report(?int $semesterId, ?int $classId): array
    {
        $report = $this->reports->overview($semesterId, $classId);

        if (empty($report['semester'])) {
            throw new NotFoundHttpException('Chưa có dữ liệu học kỳ để xuất báo cáo.');
        }

        $className = $classId
            ? collect($report['class_options'])->firstWhere('id', $classId)['code'] ?? null
            : null;

        return [
            'filename' => 'bao-cao-hoc-vu-' . Str::slug($report['semester']['name']) . '.pdf',
            'content' => $this->pdf->render('pdf.report', [
                'report' => $report,
                'className' => $className,
                'generatedAt' => now()->format('d/m/Y'),
            ], 'landscape'),
        ];
    }

    private function transcriptFor(int $studentId, array $filters): array
    {
        $student = $this->students->findOrFail($studentId);
        $transcript = $this->academic->transcript($student->id, $filters);

        return [
            'filename' => 'ket-qua-hoc-tap-' . Str::slug($student->student_code) . '.pdf',
            'content' => $this->pdf->render('pdf.transcript', [
                'student' => $student,
                'transcript' => $transcript,
                'filterText' => $this->describeFilters($transcript['options'], $filters),
                'generatedAt' => now()->format('d/m/Y'),
            ]),
        ];
    }

    private function describeFilters(array $options, array $filters): string
    {
        $parts = [];

        if (! empty($filters['academic_year'])) {
            $parts[] = 'Năm học: ' . $filters['academic_year'];
        }
        if (! empty($filters['semester_id'])) {
            $semester = collect($options['semesters'])->firstWhere('id', (int) $filters['semester_id']);
            $parts[] = 'Học kỳ: ' . ($semester['name'] ?? $filters['semester_id']);
        }
        if (! empty($filters['subject_id'])) {
            $subject = collect($options['subjects'])->firstWhere('id', (int) $filters['subject_id']);
            $parts[] = 'Môn học: ' . ($subject['name'] ?? $filters['subject_id']);
        }

        return $parts ? implode(' · ', $parts) : 'Toàn bộ quá trình học tập';
    }
}
