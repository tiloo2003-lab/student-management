<?php

namespace App\Contracts\Services;

interface AcademicServiceInterface
{
    public function transcript(int $studentId, array $filters = []): array;
}
