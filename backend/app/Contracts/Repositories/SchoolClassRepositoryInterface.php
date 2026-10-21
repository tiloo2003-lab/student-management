<?php

namespace App\Contracts\Repositories;

interface SchoolClassRepositoryInterface extends BaseRepositoryInterface
{
    public function countByHomeroomTeacher(int $teacherId, ?int $exceptClassId = null): int;
}