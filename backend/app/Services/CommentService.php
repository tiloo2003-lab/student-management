<?php

namespace App\Services;

use App\Contracts\Repositories\CommentRepositoryInterface;
use App\Contracts\Services\CommentServiceInterface;
use App\Models\Comment;
use App\Models\Post;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class CommentService implements CommentServiceInterface
{
    public function __construct(private CommentRepositoryInterface $comments)
    {
    }

    public function forPost(Post $post): Collection
    {
        return $this->comments->forPost($post);
    }

    public function add(Post $post, array $data): Comment
    {
        $name = trim(strip_tags($data['name']));
        $content = trim(preg_replace('/[ \t]+/u', ' ', strip_tags($data['content'])));

        if ($name === '' || $content === '') {
            throw new UnprocessableEntityHttpException('Tên và nội dung bình luận không được để trống.');
        }

        $this->assertNoBannedWords($content);
        $this->assertNotTooManyLinks($content);

        if ($this->comments->existsRecent($post->id, $name, $content, (int) config('school.comment_duplicate_seconds'))) {
            throw new UnprocessableEntityHttpException('Bạn vừa gửi bình luận này, vui lòng đợi một lát trước khi gửi lại.');
        }

        return $this->comments->create(['post_id' => $post->id, 'name' => $name, 'content' => $content]);
    }

    public function adminList(array $filters, int $perPage): LengthAwarePaginator
    {
        return $this->comments->paginateAdmin($filters, $perPage);
    }

    public function delete(Comment $comment): void
    {
        $this->comments->delete($comment);
    }

    private function assertNoBannedWords(string $content): void
    {
        $text = mb_strtolower($content);

        foreach ((array) config('school.comment_banned_words') as $word) {
            if ($word !== '' && str_contains($text, mb_strtolower($word))) {
                throw new UnprocessableEntityHttpException('Bình luận chứa nội dung không phù hợp.');
            }
        }
    }

    private function assertNotTooManyLinks(string $content): void
    {
        $links = preg_match_all('~https?://|www\.~i', $content);

        if ($links > (int) config('school.comment_max_links')) {
            throw new UnprocessableEntityHttpException('Bình luận chứa quá nhiều liên kết.');
        }
    }
}
