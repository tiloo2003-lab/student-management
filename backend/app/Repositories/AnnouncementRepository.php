<?php

namespace App\Repositories;

use App\Contracts\Repositories\AnnouncementRepositoryInterface;
use App\Models\Announcement;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

class AnnouncementRepository extends BaseRepository implements AnnouncementRepositoryInterface
{
    protected string $model = Announcement::class;

    protected array $with = ['author'];

    protected array $searchable = ['title', 'content'];

    private function forRole(string $role): Builder
    {
        return Announcement::with('author')
            ->when($role !== 'admin', fn (Builder $q) => $q->whereIn('target_role', ['all', $role]))
            ->orderByDesc('created_at')
            ->orderByDesc('id');
    }

    public function paginateForRole(string $role, array $filters, int $perPage): LengthAwarePaginator
    {
        $search = trim((string) ($filters['search'] ?? ''));

        return $this->forRole($role)
            ->when($search !== '', fn (Builder $q) => $q->where('title', 'like', "%$search%"))
            ->paginate($perPage);
    }

    public function recentForRole(string $role, int $limit): Collection
    {
        return $this->forRole($role)->limit($limit)->get();
    }

    public function recentPublic(int $limit): Collection
    {
        return Announcement::where('target_role', 'all')
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->limit($limit)
            ->get(['id', 'title', 'content', 'created_at']);
    }
}