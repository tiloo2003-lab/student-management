<?php

namespace App\Repositories;

use App\Contracts\Repositories\ContactMessageRepositoryInterface;
use App\Models\ContactMessage;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class ContactMessageRepository extends BaseRepository implements ContactMessageRepositoryInterface
{
    protected string $model = ContactMessage::class;

    public function paginateAdmin(array $filters, int $perPage): LengthAwarePaginator
    {
        $search = trim((string) ($filters['search'] ?? ''));

        return ContactMessage::query()
            ->when($search !== '', fn (Builder $q) => $q->where(
                fn (Builder $w) => $w->where('name', 'like', "%$search%")
                    ->orWhere('subject', 'like', "%$search%")
                    ->orWhere('email', 'like', "%$search%")
            ))
            ->orderBy('is_read')
            ->orderByDesc('id')
            ->paginate($perPage);
    }

    public function markRead(ContactMessage $message): ContactMessage
    {
        $message->update(['is_read' => true]);

        return $message;
    }
}