<?php

namespace App\Repositories;

use App\Contracts\Repositories\StudentRepositoryInterface;
use App\Models\Student;
use Illuminate\Support\Collection;

class StudentRepository extends BaseRepository implements StudentRepositoryInterface
{
    protected string $model = Student::class;

    protected array $with = ['user:id,name,email,phone,status', 'schoolClass:id,code,name,department_id,academic_year'];

    protected array $searchable = ['student_code', 'user.name', 'user.email'];

    protected array $filterable = ['class_id', 'gender'];

    protected array $relationFilters = [
        'academic_year' => 'schoolClass.academic_year',
        'department_id' => 'schoolClass.department_id',
        'status' => 'user.status',
    ];

    public function findByUserId(int $userId): ?Student
    {
        return Student::where('user_id', $userId)->first();
    }

    public function countByDepartment(int $limit = 8): Collection
    {
        return Student::query()
            ->join('classes', 'classes.id', '=', 'students.class_id')
            ->join('departments', 'departments.id', '=', 'classes.department_id')
            ->selectRaw('departments.code as label, COUNT(*) as total')
            ->groupBy('departments.id', 'departments.code')
            ->orderByDesc('total')
            ->limit($limit)
            ->toBase()
            ->get();
    }

    public function countByGender(): Collection
    {
        return Student::query()
            ->selectRaw('gender as label, COUNT(*) as total')
            ->groupBy('gender')
            ->toBase()
            ->get();
    }

    public function countInClass(int $classId): int
    {
        return Student::where('class_id', $classId)->count();
    }
}
