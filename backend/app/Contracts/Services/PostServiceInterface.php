<?php

namespace App\Contracts\Services;

use App\Models\Post;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;

interface PostServiceInterface
{
    public function publicList(array $filters, int $perPage): LengthAwarePaginator;

    public function show(Post $post): array;

    public function like(Post $post): int;

    public function unlike(Post $post): int;

    public function adminList(array $filters, int $perPage): LengthAwarePaginator;

    public function adminShow(Post $post): Post;

    public function create(User $author, array $data, ?UploadedFile $image): Post;

    public function update(Post $post, array $data, ?UploadedFile $image, bool $removeImage): Post;

    public function delete(Post $post): void;
}