<?php

namespace App\Contracts\Support;

interface TransactionInterface
{
    public function run(callable $callback): mixed;
}