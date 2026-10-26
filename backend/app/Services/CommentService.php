<?php

namespace App\Services;

use App\Contracts\Repositories\CommentRepositoryInterface;
use App\Contracts\Services\CommentServiceInterface;
use App\Models\Comment;
use App\Models\Post;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
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

    public function add(Post $post, User $author, array $data): Comment
    {
        $content = trim(preg_replace('/[ \t]+/u', ' ', strip_tags($data['content'])));

        if ($content === '') {
            throw new UnprocessableEntityHttpException('The comment cannot be empty.');
        }

        $this->assertNoBannedWords($content);
        $this->assertNotTooManyLinks($content);

        if ($this->comments->existsRecent($post->id, $author->id, $content, (int) config('school.comment_duplicate_seconds'))) {
            throw new UnprocessableEntityHttpException('You just sent this comment. Please wait a moment before sending it again.');
        }

        return $this->comments->create([
            'post_id' => $post->id,
            'user_id' => $author->id,
            'name' => $author->name,
            'content' => $content,
        ]);
    }

    public function adminList(array $filters, int $perPage): LengthAwarePaginator
    {
        return $this->comments->paginateAdmin($filters, $perPage);
    }

    public function delete(Comment $comment): void
    {
        $this->comments->delete($comment);
    }

    public function deleteOwn(User $user, Comment $comment): void
    {
        if ($user->role !== 'admin' && $comment->user_id !== $user->id) {
            throw new AccessDeniedHttpException('You can only delete your own comments.');
        }

        $this->comments->delete($comment);
    }

    private function assertNoBannedWords(string $content): void
    {
        $text = mb_strtolower($content);

        foreach ((array) config('school.comment_banned_words') as $word) {
            if ($word !== '' && str_contains($text, mb_strtolower($word))) {
                throw new UnprocessableEntityHttpException('The comment contains inappropriate content.');
            }
        }
    }

    private function assertNotTooManyLinks(string $content): void
    {
        $links = preg_match_all('~https?://|www\.~i', $content);

        if ($links > (int) config('school.comment_max_links')) {
            throw new UnprocessableEntityHttpException('The comment contains too many links.');
        }
    }
}
