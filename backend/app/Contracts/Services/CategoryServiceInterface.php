<?php

namespace App\Contracts\Services;

use Illuminate\Database\Eloquent\Collection;

interface CategoryServiceInterface extends CrudServiceInterface
{
    public function publicList(): Collection;
}