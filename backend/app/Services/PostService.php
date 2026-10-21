<?php

namespace App\Services;

use App\Contracts\Repositories\PostRepositoryInterface;
use App\Contracts\Services\PostServiceInterface;
use App\Contracts\Support\ImageStorageInterface;
use App\Models\Post;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;

class PostService implements PostServiceInterface
{
    private const IMAGE_DIRECTORY = 'uploads/posts';

    public function __construct(
        private PostRepositoryInterface $posts,
        private ImageStorageInterface $images,
    ) {
    }

    public function publicList(array $filters, int $perPage): LengthAwarePaginator
    {
        return $this->posts->paginatePublic($filters, $perPage);
    }

    public function show(Post $post): array
    {
        $this->posts->incrementViews($post);
        $this->posts->withRelations($post);

        return $post->toArray() + ['related' => $this->posts->related($post, 4)];
    }

    public function like(Post $post): int
    {
        return $this->posts->incrementLikes($post);
    }

    public function unlike(Post $post): int
    {
        return $this->posts->decrementLikes($post);
    }

    public function adminList(array $filters, int $perPage): LengthAwarePaginator
    {
        return $this->posts->paginateAdmin($filters, $perPage);
    }

    public function adminShow(Post $post): Post
    {
        return $this->posts->withRelations($post);
    }

    public function create(User $author, array $data, ?UploadedFile $image): Post
    {
        return $this->posts->create([
            'title' => $data['title'],
            'description' => $data['description'],
            'content' => $data['content'] ?? null,
            'category_id' => $data['category_id'] ?? null,
            'image' => $image ? $this->images->store($image, self::IMAGE_DIRECTORY) : null,
            'author_id' => $author->id,
        ]);
    }

    public function update(Post $post, array $data, ?UploadedFile $image, bool $removeImage): Post
    {
        $payload = [
            'title' => $data['title'],
            'description' => $data['description'],
            'content' => $data['content'] ?? null,
            'category_id' => $data['category_id'] ?? null,
        ];

        if ($image) {
            $this->images->delete($post->image);
            $payload['image'] = $this->images->store($image, self::IMAGE_DIRECTORY);
        } elseif ($removeImage) {
            $this->images->delete($post->image);
            $payload['image'] = null;
        }

        return $this->posts->update($post, $payload);
    }

    public function delete(Post $post): void
    {
        $this->images->delete($post->image);
        $this->posts->delete($post);
    }
}
