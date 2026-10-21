<?php

namespace App\Contracts\Repositories;

use App\Models\Teacher;

interface TeacherRepositoryInterface extends BaseRepositoryInterface
{
    public function findByUserId(int $userId): ?Teacher;
}