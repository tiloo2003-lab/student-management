<?php

namespace App\Services;

use App\Contracts\Repositories\BaseRepositoryInterface;
use App\Contracts\Services\CrudServiceInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\QueryException;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

class CrudService implements CrudServiceInterface
{
    protected string $deleteConflictMessage = 'Cannot delete because this record is in use elsewhere.';

    public function __construct(protected BaseRepositoryInterface $repository)
    {
    }

    public function paginate(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        return $this->repository->paginate($filters, $perPage);
    }

    public function all(array $filters = []): Collection
    {
        return $this->repository->all($filters);
    }

    public function find(int|string $id): Model
    {
        return $this->repository->findOrFail($id);
    }

    public function create(array $data): Model
    {
        return $this->repository->create($data);
    }

    public function update(int|string $id, array $data): Model
    {
        return $this->repository->update($this->repository->findOrFail($id), $data);
    }

    public function delete(int|string $id): void
    {
        $model = $this->repository->findOrFail($id);

        try {
            $this->repository->delete($model);
        } catch (QueryException) {
            throw new ConflictHttpException($this->deleteConflictMessage);
        }
    }
}
