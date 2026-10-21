<?php

namespace App\Services;

use App\Contracts\Repositories\CategoryRepositoryInterface;
use App\Contracts\Services\CategoryServiceInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class CategoryService extends CrudService implements CategoryServiceInterface
{
    public function __construct(private CategoryRepositoryInterface $categories)
    {
        parent::__construct($categories);
    }

    public function create(array $data): Model
    {
        return parent::create($this->withSlug($data));
    }

    public function update(int|string $id, array $data): Model
    {
        return parent::update($id, $this->withSlug($data));
    }

    public function publicList(): Collection
    {
        return $this->categories->withPostCounts();
    }

    private function withSlug(array $data): array
    {
        return $data + ['slug' => Str::slug($data['name'])];
    }
}
