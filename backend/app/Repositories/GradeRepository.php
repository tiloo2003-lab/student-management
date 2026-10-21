<?php

namespace App\Repositories;

use App\Contracts\Repositories\GradeRepositoryInterface;
use App\Models\Grade;
use Illuminate\Support\Collection;

class GradeRepository extends BaseRepository implements GradeRepositoryInterface
{
    protected string $model = Grade::class;

    public function upsert(int $enrollmentId, array $data): Grade
    {
        return Grade::updateOrCreate(['enrollment_id' => $enrollmentId], $data);
    }

    public function distribution(): Collection
    {
        return Grade::query()
            ->whereNotNull('letter')
            ->selectRaw('letter as label, COUNT(*) as total')
            ->groupBy('letter')
            ->orderBy('letter')
            ->toBase()
            ->get();
    }
}