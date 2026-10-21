<?php

namespace App\Contracts\Repositories;

use App\Models\Semester;
use Illuminate\Database\Eloquent\Collection;

interface SemesterRepositoryInterface extends BaseRepositoryInterface
{
    public function current(): ?Semester;

    public function clearCurrentExcept(int $id): void;

    public function overlapping(string $start, string $end, ?int $exceptId = null): Collection;
}