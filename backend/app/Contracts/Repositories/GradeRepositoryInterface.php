<?php

namespace App\Contracts\Repositories;

use App\Models\Grade;
use Illuminate\Support\Collection;

interface GradeRepositoryInterface extends BaseRepositoryInterface
{
    public function upsert(int $enrollmentId, array $data): Grade;

    public function distribution(): Collection;
}