<?php

namespace App\Http\Controllers\Api;

use App\Contracts\Services\CommentServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\CommentRequest;
use App\Models\Comment;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function __construct(private CommentServiceInterface $comments)
    {
    }

    public function index(Post $post)
    {
        return $this->comments->forPost($post);
    }

    public function store(CommentRequest $request, Post $post): JsonResponse
    {
        $comment = $this->comments->add($post, $request->user(), $request->validated());

        return response()->json($comment->only(['id', 'user_id', 'name', 'content', 'created_at']), 201);
    }

    public function destroyOwn(Request $request, Post $post, Comment $comment): array
    {
        $this->comments->deleteOwn($request->user(), $comment);

        return ['message' => 'Comment deleted.'];
    }

    public function adminIndex(Request $request)
    {
        return $this->comments->adminList($request->query(), min((int) $request->query('per_page', 10), 100));
    }

    public function destroy(Comment $comment): array
    {
        $this->comments->delete($comment);

        return ['message' => 'Comment deleted.'];
    }
}
