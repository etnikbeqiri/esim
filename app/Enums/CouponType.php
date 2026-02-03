<?php

namespace App\Enums;

enum CouponType: string
{
    case Percentage = 'percentage';
    case FixedAmount = 'fixed_amount';

    public function label(): string
    {
        return match ($this) {
            self::Percentage => 'Percentage Discount',
            self::FixedAmount => 'Fixed Amount',
        };
    }

    public function description(): string
    {
        return match ($this) {
            self::Percentage => 'Discount calculated as a percentage of the order amount',
            self::FixedAmount => 'Fixed discount amount subtracted from the order total',
        };
    }

    public function icon(): string
    {
        return match ($this) {
            self::Percentage => '%',
            self::FixedAmount => '€',
        };
    }
}
