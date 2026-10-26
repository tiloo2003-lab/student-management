<?php

namespace App\Support;

class GradeCalculator
{
    public const MIDTERM_WEIGHT = 0.4;

    public const FINAL_WEIGHT = 0.6;

    public static function total(?float $midterm, ?float $final): ?float
    {
        if ($midterm === null || $final === null) {
            return null;
        }

        return round($midterm * self::MIDTERM_WEIGHT + $final * self::FINAL_WEIGHT, 2);
    }

    public static function letter(?float $total): ?string
    {
        if ($total === null) {
            return null;
        }

        return match (true) {
            $total >= 8.5 => 'A',
            $total >= 7 => 'B',
            $total >= 5.5 => 'C',
            $total >= 4 => 'D',
            default => 'F',
        };
    }

    public static function passed(?float $total): bool
    {
        return $total !== null && $total >= (float) config('school.pass_mark', 4.0);
    }

    public static function point4(?string $letter): float
    {
        return match ($letter) {
            'A' => 4.0,
            'B' => 3.0,
            'C' => 2.0,
            'D' => 1.0,
            default => 0.0,
        };
    }

    public static function classification(?float $gpa): ?string
    {
        if ($gpa === null) {
            return null;
        }

        return match (true) {
            $gpa >= 9.0 => 'Excellent',
            $gpa >= 8.0 => 'Very good',
            $gpa >= 7.0 => 'Good',
            $gpa >= 5.5 => 'Average',
            $gpa >= 4.0 => 'Weak',
            default => 'Poor',
        };
    }

    public static function summarize(iterable $enrollments): array
    {
        $credits = 0;
        $earned = 0;
        $failed = 0;
        $weighted = 0.0;
        $weighted4 = 0.0;

        foreach ($enrollments as $enrollment) {
            $total = $enrollment->grade?->total;
            if ($total === null) {
                continue;
            }

            $credit = (int) $enrollment->course->subject->credits;
            $credits += $credit;
            $weighted += $total * $credit;
            $weighted4 += self::point4($enrollment->grade->letter) * $credit;

            if (self::passed($total)) {
                $earned += $credit;
            } else {
                $failed += $credit;
            }
        }

        return [
            'gpa' => $credits > 0 ? round($weighted / $credits, 2) : null,
            'gpa4' => $credits > 0 ? round($weighted4 / $credits, 2) : null,
            'credits' => $credits,
            'credits_earned' => $earned,
            'credits_failed' => $failed,
        ];
    }
}
