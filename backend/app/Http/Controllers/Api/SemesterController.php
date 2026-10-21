<?php

namespace App\Http\Controllers\Api;

use App\Contracts\Services\SemesterServiceInterface;
use App\Http\Requests\SemesterRequest;
use Illuminate\Http\JsonResponse;

class SemesterController extends ResourceController
{
    public function __construct(SemesterServiceInterface $service)
    {
        parent::__construct($service);
    }

    public function store(SemesterRequest $request): JsonResponse
    {
        return $this->storeResource($request->validated());
    }

    public function update(SemesterRequest $request, int|string $id)
    {
        return $this->updateResource($id, $request->validated());
    }
}
