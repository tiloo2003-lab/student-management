<?php

namespace App\Repositories;

use App\Contracts\Repositories\SemesterRepositoryInterface;
use App\Models\Semester;
use Illuminate\Database\Eloquent\Collection;

class SemesterRepository extends BaseRepository implements SemesterRepositoryInterface
{
    protected string $model = Semester::class;

    protected array $searchable = ['name', 'academic_year'];

    protected array $filterable = ['academic_year'];

    public function current(): ?Semester
    {
        return Semester::where('is_current', true)->first();
    }

    public function clearCurrentExcept(int $id): void
    {
        Semester::where('id', '!=', $id)->update(['is_current' => false]);
    }

    public function overlapping(string $start, string $end, ?int $exceptId = null): Collection
    {
        return Semester::where('start_date', '<=', $end)
            ->where('end_date', '>=', $start)
            ->when($exceptId, fn ($q) => $q->where('id', '!=', $exceptId))
            ->get();
    }
}
