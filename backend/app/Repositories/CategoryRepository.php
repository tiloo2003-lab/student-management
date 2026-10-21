<?php

namespace App\Repositories;

use App\Contracts\Repositories\CategoryRepositoryInterface;
use App\Models\Category;
use Illuminate\Database\Eloquent\Collection;

class CategoryRepository extends BaseRepository implements CategoryRepositoryInterface
{
    protected string $model = Category::class;

    protected array $withCount = ['posts'];

    protected array $searchable = ['name', 'slug'];

    public function withPostCounts(?int $limit = null): Collection
    {
        return Category::withCount('posts')
            ->orderByDesc('posts_count')
            ->orderBy('name')
            ->when($limit, fn ($q) => $q->limit($limit))
            ->get();
    }
}