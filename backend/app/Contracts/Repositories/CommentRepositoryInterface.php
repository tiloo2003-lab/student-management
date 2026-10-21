<?php

namespace App\Contracts\Repositories;

use App\Models\Post;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface CommentRepositoryInterface extends BaseRepositoryInterface
{
    public function forPost(Post $post, int $limit = 100): Collection;

    public function paginateAdmin(array $filters, int $perPage): LengthAwarePaginator;

    public function existsRecent(int $postId, string $name, string $content, int $seconds): bool;
}