<?php

namespace App\Http\Controllers\Api;

use App\Contracts\Services\CrudServiceInterface;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

abstract class ResourceController extends Controller
{
    public function __construct(protected CrudServiceInterface $service)
    {
    }

    public function index(Request $request)
    {
        $filters = $request->query();

        if ($request->boolean('all')) {
            return response()->json(['data' => $this->service->all($filters)]);
        }

        return $this->service->paginate($filters, min((int) $request->query('per_page', 10), 100));
    }

    public function show(int|string $id)
    {
        return $this->service->find($id);
    }

    public function destroy(int|string $id): JsonResponse
    {
        $this->service->delete($id);

        return response()->json(['message' => 'Đã xóa.']);
    }

    protected function storeResource(array $data): JsonResponse
    {
        return response()->json($this->service->create($data), 201);
    }

    protected function updateResource(int|string $id, array $data)
    {
        return $this->service->update($id, $data);
    }
}
