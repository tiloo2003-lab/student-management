<?php

namespace App\Http\Controllers\Api;

use App\Contracts\Services\TeacherServiceInterface;
use App\Http\Requests\TeacherRequest;
use Illuminate\Http\JsonResponse;

class TeacherController extends ResourceController
{
    public function __construct(TeacherServiceInterface $service)
    {
        parent::__construct($service);
    }

    public function store(TeacherRequest $request): JsonResponse
    {
        return $this->storeResource($request->validated());
    }

    public function update(TeacherRequest $request, int|string $id)
    {
        return $this->updateResource($id, $request->validated());
    }
}
