<?php

namespace App\Repositories;

use App\Contracts\Repositories\SchoolClassRepositoryInterface;
use App\Models\SchoolClass;
use Illuminate\Database\Eloquent\Collection;

class SchoolClassRepository extends BaseRepository implements SchoolClassRepositoryInterface
{
    protected string $model = SchoolClass::class;

    protected array $with = ['department:id,name', 'homeroomTeacher'];

    protected array $withCount = ['students'];

    protected array $searchable = ['code', 'name'];

    protected array $filterable = ['department_id', 'academic_year'];

    public function countByHomeroomTeacher(int $teacherId, ?int $exceptClassId = null): int
    {
        return SchoolClass::where('homeroom_teacher_id', $teacherId)
            ->when($exceptClassId, fn ($q) => $q->where('id', '!=', $exceptClassId))
            ->count();
    }

    public function forHomeroomTeacher(int $teacherId): Collection
    {
        return SchoolClass::with([
            'department:id,name',
            'students' => fn ($q) => $q->with('user:id,name,email,phone,status')->orderBy('student_code'),
        ])
            ->withCount('students')
            ->where('homeroom_teacher_id', $teacherId)
            ->orderBy('code')
            ->get();
    }
}