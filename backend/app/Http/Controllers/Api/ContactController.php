<?php

namespace App\Http\Controllers\Api;

use App\Contracts\Services\ContactServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\ContactRequest;
use App\Models\ContactMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function __construct(private ContactServiceInterface $contacts)
    {
    }

    public function store(ContactRequest $request): JsonResponse
    {
        $this->contacts->submit($request->validated());

        return response()->json(['message' => 'Your message has been sent. We will get back to you soon.'], 201);
    }

    public function index(Request $request)
    {
        return $this->contacts->adminList($request->query(), min((int) $request->query('per_page', 10), 100));
    }

    public function markRead(ContactMessage $message)
    {
        return $this->contacts->markRead($message);
    }

    public function destroy(ContactMessage $message): array
    {
        $this->contacts->delete($message);

        return ['message' => 'Deleted.'];
    }
}
