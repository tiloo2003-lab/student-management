<?php

namespace App\Http\Requests;

class CommentRequest extends ApiFormRequest
{
    public function rules(): array
    {
        return [
            'content' => ['required', 'string', 'max:1000'],
        ];
    }
}
