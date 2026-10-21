<?php

namespace App\Repositories;

use App\Contracts\Repositories\TeacherRepositoryInterface;
use App\Models\Teacher;

class TeacherRepository extends BaseRepository implements TeacherRepositoryInterface
{
    protected string $model = Teacher::class;

    protected array $with = ['user:id,name,email,phone,status', 'department:id,name'];

    protected array $searchable = ['teacher_code', 'user.name', 'user.email'];

    protected array $filterable = ['department_id', 'degree'];

    public function findByUserId(int $userId): ?Teacher
    {
        return Teacher::where('user_id', $userId)->first();
    }
}