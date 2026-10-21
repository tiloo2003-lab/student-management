<?php

namespace App\Support;

use App\Contracts\Support\TransactionInterface;
use Illuminate\Support\Facades\DB;

class DatabaseTransaction implements TransactionInterface
{
    public function run(callable $callback): mixed
    {
        return DB::transaction($callback);
    }
}