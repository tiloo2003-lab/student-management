<?php

namespace App\Support;

class Schedule
{
    public static function conflicts(mixed $a, mixed $b): bool
    {
        $dayA = data_get($a, 'day_of_week');
        $dayB = data_get($b, 'day_of_week');
        $startA = data_get($a, 'start_period');
        $startB = data_get($b, 'start_period');
        $endA = data_get($a, 'end_period');
        $endB = data_get($b, 'end_period');

        if (! $dayA || ! $dayB || ! $startA || ! $startB || ! $endA || ! $endB) {
            return false;
        }

        return (int) $dayA === (int) $dayB && $startA <= $endB && $startB <= $endA;
    }
}
