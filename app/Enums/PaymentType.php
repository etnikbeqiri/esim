<?php

namespace App\Enums;

enum PaymentType: string
{
    case Checkout = 'checkout';
    case Balance = 'balance';
    case Refund = 'refund';
    case TopUp = 'top_up';

    public function label(): string
    {
        return match ($this) {
            self::Checkout => 'Card/Online Payment',
            self::Balance => 'Balance Payment',
            self::Refund => 'Refund',
            self::TopUp => 'Balance Top Up',
        };
    }

    public function isDebit(): bool
    {
        return in_array($this, [self::Checkout, self::Balance]);
    }

    public function isCredit(): bool
    {
        return in_array($this, [self::Refund, self::TopUp]);
    }
}
