<?php

namespace App\Repositories;

use App\Contracts\Repositories\PostRepositoryInterface;
use App\Models\Post;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

class PostRepository extends BaseRepository implements PostRepositoryInterface
{
    public const LIST_COLUMNS = ['id', 'title', 'description', 'image', 'author_id', 'category_id', 'likes_count', 'views_count', 'created_at'];

    protected string $model = Post::class;

    protected array $with = ['author', 'category'];

    private function listQuery(): Builder
    {
        return Post::with($this->with)->select(self::LIST_COLUMNS);
    }

    public function paginatePublic(array $filters, int $perPage): LengthAwarePaginator
    {
        $query = $this->listQuery();
        $search = trim((string) ($filters['search'] ?? ''));

        if ($search !== '') {
            $query->where(fn (Builder $w) => $w->where('title', 'like', "%$search%")->orWhere('description', 'like', "%$search%"));
        }
        if (! empty($filters['category'])) {
            $query->whereHas('category', fn (Builder $c) => $c->where('slug', $filters['category']));
        }

        match ($filters['sort'] ?? null) {
            'likes' => $query->orderByDesc('likes_count')->orderByDesc('id'),
            'views' => $query->orderByDesc('views_count')->orderByDesc('id'),
            'latest' => $query->orderByDesc('created_at')->orderByDesc('id'),
            default => $query->orderBy('id'),
        };

        return $query->paginate($perPage);
    }

    public function paginateAdmin(array $filters, int $perPage): LengthAwarePaginator
    {
        $search = trim((string) ($filters['search'] ?? ''));

        return $this->listQuery()
            ->when($search !== '', fn (Builder $q) => $q->where('title', 'like', "%$search%"))
            ->orderByDesc('id')
            ->paginate($perPage);
    }

    public function withRelations(Post $post): Post
    {
        return $post->load($this->with);
    }

    public function related(Post $post, int $limit = 4): Collection
    {
        return $this->listQuery()
            ->where('id', '!=', $post->id)
            ->when($post->category_id, fn (Builder $q) => $q->where('category_id', $post->category_id))
            ->orderByDesc('likes_count')
            ->limit($limit)
            ->get();
    }

    public function latest(int $limit): Collection
    {
        return $this->listQuery()->orderByDesc('created_at')->orderByDesc('id')->limit($limit)->get();
    }

    public function popular(int $limit): Collection
    {
        return $this->listQuery()->orderByDesc('views_count')->limit($limit)->get();
    }

    public function latestInCategory(int $categoryId, int $limit): Collection
    {
        return $this->listQuery()->where('category_id', $categoryId)->orderByDesc('created_at')->limit($limit)->get();
    }

    public function incrementViews(Post $post): void
    {
        Post::whereKey($post->id)->increment('views_count');
        $post->views_count++;
    }

    public function incrementLikes(Post $post): int
    {
        Post::whereKey($post->id)->increment('likes_count');

        return (int) Post::whereKey($post->id)->value('likes_count');
    }

    public function decrementLikes(Post $post): int
    {
        Post::whereKey($post->id)->where('likes_count', '>', 0)->decrement('likes_count');

        return (int) Post::whereKey($post->id)->value('likes_count');
    }
}