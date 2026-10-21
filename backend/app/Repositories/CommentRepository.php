<?php

namespace App\Repositories;

use App\Contracts\Repositories\CommentRepositoryInterface;
use App\Models\Comment;
use App\Models\Post;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

class CommentRepository extends BaseRepository implements CommentRepositoryInterface
{
    protected string $model = Comment::class;

    protected array $with = ['post'];

    public function forPost(Post $post, int $limit = 100): Collection
    {
        return $post->comments()->orderByDesc('id')->limit($limit)->get(['id', 'user_id', 'name', 'content', 'created_at']);
    }

    public function paginateAdmin(array $filters, int $perPage): LengthAwarePaginator
    {
        $search = trim((string) ($filters['search'] ?? ''));

        return Comment::with('post')
            ->when($search !== '', fn (Builder $q) => $q->where(
                fn (Builder $w) => $w->where('name', 'like', "%$search%")->orWhere('content', 'like', "%$search%")
            ))
            ->orderByDesc('id')
            ->paginate($perPage);
    }

    public function existsRecent(int $postId, int $userId, string $content, int $seconds): bool
    {
        return Comment::where('post_id', $postId)
            ->where('user_id', $userId)
            ->where('content', $content)
            ->where('created_at', '>=', now()->subSeconds($seconds))
            ->exists();
    }
}
