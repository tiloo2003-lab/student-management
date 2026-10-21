<?php

namespace App\Http\Controllers\Api;

use App\Contracts\Services\SchoolClassServiceInterface;
use App\Http\Requests\SchoolClassRequest;
use Illuminate\Http\JsonResponse;

class ClassController extends ResourceController
{
    public function __construct(SchoolClassServiceInterface $service)
    {
        parent::__construct($service);
    }

    public function store(SchoolClassRequest $request): JsonResponse
    {
        return $this->storeResource($request->validated());
    }

    public function update(SchoolClassRequest $request, int|string $id)
    {
        return $this->updateResource($id, $request->validated());
    }
}
