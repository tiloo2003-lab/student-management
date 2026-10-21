<?php

namespace App\Contracts\Services;

interface ReportServiceInterface
{
    public function overview(?int $semesterId): array;
}