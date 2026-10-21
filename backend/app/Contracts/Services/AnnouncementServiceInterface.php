<?php

namespace App\Contracts\Services;

use App\Models\Announcement;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface AnnouncementServiceInterface extends CrudServiceInterface
{
    public function paginateFor(User $user, array $filters, int $perPage): LengthAwarePaginator;

    public function publish(User $author, array $data): Announcement;
}