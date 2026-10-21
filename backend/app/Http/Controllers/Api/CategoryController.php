<?php

namespace App\Http\Controllers\Api;

use App\Contracts\Services\CategoryServiceInterface;
use App\Http\Requests\CategoryRequest;
use Illuminate\Http\JsonResponse;

class CategoryController extends ResourceController
{
    public function __construct(private CategoryServiceInterface $categories)
    {
        parent::__construct($categories);
    }

    public function store(CategoryRequest $request): JsonResponse
    {
        return $this->storeResource($request->validated());
    }

    public function update(CategoryRequest $request, int|string $id)
    {
        return $this->updateResource($id, $request->validated());
    }

    public function publicIndex()
    {
        return $this->categories->publicList();
    }
}
