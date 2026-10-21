<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\SubjectRequest;
use Illuminate\Http\JsonResponse;

class SubjectController extends ResourceController
{
    public function store(SubjectRequest $request): JsonResponse
    {
        return $this->storeResource($request->validated());
    }

    public function update(SubjectRequest $request, int|string $id)
    {
        return $this->updateResource($id, $request->validated());
    }
}
