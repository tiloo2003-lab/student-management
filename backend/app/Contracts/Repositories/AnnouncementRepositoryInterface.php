<?php

namespace App\Contracts\Repositories;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface AnnouncementRepositoryInterface extends BaseRepositoryInterface
{
    public function paginateForRole(string $role, array $filters, int $perPage): LengthAwarePaginator;

    public function recentForRole(string $role, int $limit): Collection;

    public function recentPublic(int $limit): Collection;
}