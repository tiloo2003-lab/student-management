<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

abstract class ApiFormRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function routeId(string $parameter): int|string|null
    {
        $value = $this->route($parameter);

        return is_object($value) ? $value->getKey() : $value;
    }
}