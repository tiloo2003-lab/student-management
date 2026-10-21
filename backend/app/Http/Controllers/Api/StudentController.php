<?php

namespace App\Http\Controllers\Api;

use App\Contracts\Services\StudentServiceInterface;
use App\Http\Requests\StudentRequest;
use Illuminate\Http\JsonResponse;

class StudentController extends ResourceController
{
    public function __construct(StudentServiceInterface $service)
    {
        parent::__construct($service);
    }

    public function store(StudentRequest $request): JsonResponse
    {
        return $this->storeResource($request->validated());
    }

    public function update(StudentRequest $request, int|string $id)
    {
        return $this->updateResource($id, $request->validated());
    }
}
