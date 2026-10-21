<?php

namespace App\Services;

use App\Contracts\Repositories\ContactMessageRepositoryInterface;
use App\Contracts\Services\ContactServiceInterface;
use App\Models\ContactMessage;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ContactService implements ContactServiceInterface
{
    public function __construct(private ContactMessageRepositoryInterface $messages)
    {
    }

    public function submit(array $data): ContactMessage
    {
        return $this->messages->create($data);
    }

    public function adminList(array $filters, int $perPage): LengthAwarePaginator
    {
        return $this->messages->paginateAdmin($filters, $perPage);
    }

    public function markRead(ContactMessage $message): ContactMessage
    {
        return $this->messages->markRead($message);
    }

    public function delete(ContactMessage $message): void
    {
        $this->messages->delete($message);
    }
}
