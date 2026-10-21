<?php

namespace App\Contracts\Repositories;

use App\Models\Student;
use Illuminate\Support\Collection;

interface StudentRepositoryInterface extends BaseRepositoryInterface
{
    public function findByUserId(int $userId): ?Student;

    public function countInClass(int $classId): int;

    public function countByDepartment(int $limit = 8): Collection;

    public function countByGender(): Collection;
}