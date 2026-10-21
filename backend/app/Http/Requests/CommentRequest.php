<?php

namespace App\Http\Requests;

class CommentRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'content' => ['required', 'string', 'max:1000'],
        ];
    }
}