<?php

namespace App\Enums;

enum EsimProfileStatus: string
{
    case Pending = 'pending';
    case Active = 'active';
    case Activated = 'activated';
    case Consumed = 'consumed';
    case Expired = 'expired';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Pending',
            self::Active => 'Active',
            self::Activated => 'Activated',
            self::Consumed => 'Consumed',
            self::Expired => 'Expired',
            self::Cancelled => 'Cancelled',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::Pending => 'gray',
            self::Active => 'green',
            self::Activated => 'blue',
            self::Consumed => 'yellow',
            self::Expired => 'red',
            self::Cancelled => 'gray',
        };
    }

    public function isUsable(): bool
    {
        return in_array($this, [self::Active, self::Activated]);
    }

    public function isTerminal(): bool
    {
        return in_array($this, [self::Consumed, self::Expired, self::Cancelled]);
    }
}
