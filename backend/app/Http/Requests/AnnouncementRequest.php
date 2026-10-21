<?php

namespace App\Http\Requests;

class AnnouncementRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:200'],
            'content' => ['required', 'string'],
            'target_role' => ['required', 'in:all,teacher,student'],
        ];
    }
}