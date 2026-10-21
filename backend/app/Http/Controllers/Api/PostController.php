<?php

namespace App\Http\Controllers\Api;

use App\Contracts\Services\PostServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\PostRequest;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PostController extends Controller
{
    public function __construct(private PostServiceInterface $posts)
    {
    }

    public function index(Request $request)
    {
        return $this->posts->publicList($request->query(), min((int) $request->query('per_page', 12), 48));
    }

    public function show(Post $post)
    {
        return $this->posts->show($post);
    }

    public function like(Post $post): array
    {
        return ['likes_count' => $this->posts->like($post)];
    }

    public function unlike(Post $post): array
    {
        return ['likes_count' => $this->posts->unlike($post)];
    }

    public function adminIndex(Request $request)
    {
        return $this->posts->adminList($request->query(), min((int) $request->query('per_page', 10), 100));
    }

    public function adminShow(Post $post)
    {
        return $this->posts->adminShow($post);
    }

    public function store(PostRequest $request): JsonResponse
    {
        $post = $this->posts->create($request->user(), $request->validated(), $request->file('image'));

        return response()->json($post, 201);
    }

    public function update(PostRequest $request, Post $post)
    {
        return $this->posts->update($post, $request->validated(), $request->file('image'), $request->boolean('remove_image'));
    }

    public function destroy(Post $post): array
    {
        $this->posts->delete($post);

        return ['message' => 'Đã xóa bài viết.'];
    }
}
