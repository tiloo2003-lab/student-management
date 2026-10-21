<?php

namespace App\Contracts\Repositories;

use App\Models\Post;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface PostRepositoryInterface extends BaseRepositoryInterface
{
    public function paginatePublic(array $filters, int $perPage): LengthAwarePaginator;

    public function paginateAdmin(array $filters, int $perPage): LengthAwarePaginator;

    public function withRelations(Post $post): Post;

    public function related(Post $post, int $limit = 4): Collection;

    public function latest(int $limit): Collection;

    public function popular(int $limit): Collection;

    public function latestInCategory(int $categoryId, int $limit): Collection;

    public function incrementViews(Post $post): void;

    public function incrementLikes(Post $post): int;

    public function decrementLikes(Post $post): int;
}