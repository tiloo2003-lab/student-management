<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\DepartmentRequest;
use Illuminate\Http\JsonResponse;

class DepartmentController extends ResourceController
{
    public function store(DepartmentRequest $request): JsonResponse
    {
        return $this->storeResource($request->validated());
    }

    public function update(DepartmentRequest $request, int|string $id)
    {
        return $this->updateResource($id, $request->validated());
    }
}
