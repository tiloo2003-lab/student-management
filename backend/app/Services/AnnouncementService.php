<?php

namespace App\Services;

use App\Contracts\Repositories\AnnouncementRepositoryInterface;
use App\Contracts\Services\AnnouncementServiceInterface;
use App\Models\Announcement;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class AnnouncementService extends CrudService implements AnnouncementServiceInterface
{
    public function __construct(private AnnouncementRepositoryInterface $announcements)
    {
        parent::__construct($announcements);
    }

    public function paginateFor(User $user, array $filters, int $perPage): LengthAwarePaginator
    {
        return $this->announcements->paginateForRole($user->role, $filters, $perPage);
    }

    public function publish(User $author, array $data): Announcement
    {
        return $this->announcements->create($data + ['author_id' => $author->id]);
    }
}
