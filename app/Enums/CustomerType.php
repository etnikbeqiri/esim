<?php

namespace App\Enums;

enum CustomerType: string
{
    case B2B = 'b2b';
    case B2C = 'b2c';

    public function label(): string
    {
        return match ($this) {
            self::B2B => 'Business (Reseller)',
            self::B2C => 'Consumer',
        };
    }

    public function description(): string
    {
        return match ($this) {
            self::B2B => 'Business customer with balance-based payment',
            self::B2C => 'Consumer customer with Stripe payment',
        };
    }

    public function hasBalance(): bool
    {
        return $this === self::B2B;
    }
}
