<?php

namespace App\Http\Controllers\Api;

use App\Contracts\Services\AnnouncementServiceInterface;
use App\Http\Requests\AnnouncementRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnnouncementController extends ResourceController
{
    public function __construct(private AnnouncementServiceInterface $announcements)
    {
        parent::__construct($announcements);
    }

    public function index(Request $request)
    {
        return $this->announcements->paginateFor(
            $request->user(),
            $request->query(),
            min((int) $request->query('per_page', 10), 100)
        );
    }

    public function store(AnnouncementRequest $request): JsonResponse
    {
        return response()->json($this->announcements->publish($request->user(), $request->validated()), 201);
    }

    public function update(AnnouncementRequest $request, int|string $id)
    {
        return $this->updateResource($id, $request->validated());
    }
}
