<?php

namespace App\Contracts\Repositories;

use Illuminate\Database\Eloquent\Collection;

interface SchoolClassRepositoryInterface extends BaseRepositoryInterface
{
    public function countByHomeroomTeacher(int $teacherId, ?int $exceptClassId = null): int;

    public function forHomeroomTeacher(int $teacherId): Collection;
}