<?php

namespace App\Contracts\Services;

use App\Models\Comment;
use App\Models\Post;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface CommentServiceInterface
{
    public function forPost(Post $post): Collection;

    public function add(Post $post, User $author, array $data): Comment;

    public function adminList(array $filters, int $perPage): LengthAwarePaginator;

    public function delete(Comment $comment): void;

    public function deleteOwn(User $user, Comment $comment): void;
}
