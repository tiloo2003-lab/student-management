<?php

namespace App\Contracts\Services;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

interface CrudServiceInterface
{
    public function paginate(array $filters = [], int $perPage = 10): LengthAwarePaginator;

    public function all(array $filters = []): Collection;

    public function find(int|string $id): Model;

    public function create(array $data): Model;

    public function update(int|string $id, array $data): Model;

    public function delete(int|string $id): void;
}