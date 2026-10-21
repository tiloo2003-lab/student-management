<?php

namespace App\Contracts\Repositories;

use App\Models\ContactMessage;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface ContactMessageRepositoryInterface extends BaseRepositoryInterface
{
    public function paginateAdmin(array $filters, int $perPage): LengthAwarePaginator;

    public function markRead(ContactMessage $message): ContactMessage;
}