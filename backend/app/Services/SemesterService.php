<?php

namespace App\Services;

use App\Contracts\Repositories\CourseRepositoryInterface;
use App\Contracts\Repositories\SemesterRepositoryInterface;
use App\Contracts\Services\SemesterServiceInterface;
use Illuminate\Database\Eloquent\Model;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class SemesterService extends CrudService implements SemesterServiceInterface
{
    public function __construct(
        private SemesterRepositoryInterface $semesters,
        private CourseRepositoryInterface $courses,
    ) {
        parent::__construct($semesters);
    }

    public function create(array $data): Model
    {
        $this->assertNoOverlap($data);

        return $this->syncCurrent(parent::create($data));
    }

    public function update(int|string $id, array $data): Model
    {
        $this->assertNoOverlap($data, (int) $id);

        return $this->syncCurrent(parent::update($id, $data));
    }

    public function delete(int|string $id): void
    {
        $semester = $this->semesters->findOrFail($id);

        if ($semester->is_current) {
            throw new ConflictHttpException('The current semester cannot be deleted.');
        }
        if ($this->courses->countInSemester($semester->id) > 0) {
            throw new ConflictHttpException('This semester has course sections and cannot be deleted.');
        }

        parent::delete($id);
    }

    private function assertNoOverlap(array $data, ?int $exceptId = null): void
    {
        $overlap = $this->semesters->overlapping($data['start_date'], $data['end_date'], $exceptId)->first();

        if ($overlap) {
            throw new UnprocessableEntityHttpException("The semester dates overlap with \"{$overlap->name}\".");
        }
    }

    private function syncCurrent(Model $semester): Model
    {
        if ($semester->is_current) {
            $this->semesters->clearCurrentExcept($semester->id);
        }

        return $semester;
    }
}
