<?php

namespace App\Repositories;

use App\Contracts\Repositories\BaseRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

abstract class BaseRepository implements BaseRepositoryInterface
{
    protected string $model;

    protected array $with = [];

    protected array $withCount = [];

    protected array $searchable = [];

    protected array $filterable = [];

    protected array $relationFilters = [];

    protected function query(): Builder
    {
        return ($this->model)::query()->with($this->with)->withCount($this->withCount);
    }

    protected function filtered(array $filters): Builder
    {
        $query = $this->query();
        $search = trim((string) ($filters['search'] ?? ''));

        if ($search !== '' && $this->searchable) {
            $query->where(function (Builder $w) use ($search) {
                foreach ($this->searchable as $column) {
                    if (str_contains($column, '.')) {
                        [$relation, $field] = explode('.', $column, 2);
                        $w->orWhereHas($relation, fn (Builder $r) => $r->where($field, 'like', "%$search%"));
                    } else {
                        $w->orWhere($column, 'like', "%$search%");
                    }
                }
            });
        }

        foreach ($this->filterable as $field) {
            if (isset($filters[$field]) && $filters[$field] !== '') {
                $query->where($field, $filters[$field]);
            }
        }

        foreach ($this->relationFilters as $param => $path) {
            if (isset($filters[$param]) && $filters[$param] !== '') {
                $cut = strrpos($path, '.');
                $relation = substr($path, 0, $cut);
                $column = substr($path, $cut + 1);
                $query->whereHas($relation, fn (Builder $q) => $q->where($column, $filters[$param]));
            }
        }

        return $query;
    }

    public function paginate(array $filters = [], int $perPage = 10): LengthAwarePaginator
    {
        return $this->filtered($filters)->orderByDesc('id')->paginate($perPage);
    }

    public function all(array $filters = []): Collection
    {
        return $this->filtered($filters)->orderByDesc('id')->get();
    }

    public function find(int|string $id): ?Model
    {
        return $this->query()->find($id);
    }

    public function findOrFail(int|string $id): Model
    {
        return $this->query()->findOrFail($id);
    }

    public function create(array $data): Model
    {
        $model = ($this->model)::create($data);

        return $this->findOrFail($model->getKey());
    }

    public function update(Model $model, array $data): Model
    {
        $model->update($data);

        return $this->findOrFail($model->getKey());
    }

    public function delete(Model $model): bool
    {
        return (bool) $model->delete();
    }

    public function count(): int
    {
        return ($this->model)::count();
    }
}