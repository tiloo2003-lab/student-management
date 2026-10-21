<?php

namespace App\Repositories;

use App\Contracts\Repositories\DepartmentRepositoryInterface;
use App\Models\Department;

class DepartmentRepository extends BaseRepository implements DepartmentRepositoryInterface
{
    protected string $model = Department::class;

    protected array $searchable = ['code', 'name'];
}