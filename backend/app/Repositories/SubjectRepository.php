<?php

namespace App\Repositories;

use App\Contracts\Repositories\SubjectRepositoryInterface;
use App\Models\Subject;

class SubjectRepository extends BaseRepository implements SubjectRepositoryInterface
{
    protected string $model = Subject::class;

    protected array $with = ['department:id,name'];

    protected array $searchable = ['code', 'name'];

    protected array $filterable = ['department_id'];
}