<?php

namespace App\Repositories;

use App\Contracts\Repositories\SchoolClassRepositoryInterface;
use App\Models\SchoolClass;

class SchoolClassRepository extends BaseRepository implements SchoolClassRepositoryInterface
{
    protected string $model = SchoolClass::class;

    protected array $with = ['department:id,name', 'homeroomTeacher'];

    protected array $withCount = ['students'];

    protected array $searchable = ['code', 'name'];

    protected array $filterable = ['department_id'];

    public function countByHomeroomTeacher(int $teacherId, ?int $exceptClassId = null): int
    {
        return SchoolClass::where('homeroom_teacher_id', $teacherId)
            ->when($exceptClassId, fn ($q) => $q->where('id', '!=', $exceptClassId))
            ->count();
    }
}