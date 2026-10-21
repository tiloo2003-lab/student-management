<?php

namespace App\Contracts\Services;

use App\Models\ContactMessage;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface ContactServiceInterface
{
    public function submit(array $data): ContactMessage;

    public function adminList(array $filters, int $perPage): LengthAwarePaginator;

    public function markRead(ContactMessage $message): ContactMessage;

    public function delete(ContactMessage $message): void;
}