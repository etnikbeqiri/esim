<?php

namespace App\Enums;

enum OrderType: string
{
    case B2B = 'b2b';
    case B2C = 'b2c';

    public function label(): string
    {
        return match ($this) {
            self::B2B => 'Business',
            self::B2C => 'Consumer',
        };
    }

    public function description(): string
    {
        return match ($this) {
            self::B2B => 'Business reseller order paid with balance',
            self::B2C => 'Consumer order paid with Stripe',
        };
    }

    public function usesBalance(): bool
    {
        return $this === self::B2B;
    }

    public function usesStripe(): bool
    {
        return $this === self::B2C;
    }
}
