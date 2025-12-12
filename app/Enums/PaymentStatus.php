<?php

namespace App\Enums;

enum PaymentStatus: string
{
    case Pending = 'pending';
    case Processing = 'processing';
    case RequiresAction = 'requires_action';
    case Completed = 'completed';
    case Failed = 'failed';
    case Cancelled = 'cancelled';
    case Refunded = 'refunded';
    case PartiallyRefunded = 'partially_refunded';
    case Disputed = 'disputed';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Pending',
            self::Processing => 'Processing',
            self::RequiresAction => 'Requires Action',
            self::Completed => 'Completed',
            self::Failed => 'Failed',
            self::Cancelled => 'Cancelled',
            self::Refunded => 'Refunded',
            self::PartiallyRefunded => 'Partially Refunded',
            self::Disputed => 'Disputed',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::Pending => 'gray',
            self::Processing => 'blue',
            self::RequiresAction => 'yellow',
            self::Completed => 'green',
            self::Failed => 'red',
            self::Cancelled => 'gray',
            self::Refunded => 'purple',
            self::PartiallyRefunded => 'purple',
            self::Disputed => 'red',
        };
    }

    public function isSuccessful(): bool
    {
        return $this === self::Completed;
    }

    public function isTerminal(): bool
    {
        return in_array($this, [self::Completed, self::Failed, self::Cancelled, self::Refunded]);
    }

    public function canRefund(): bool
    {
        return in_array($this, [self::Completed, self::PartiallyRefunded]);
    }
}
