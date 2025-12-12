<?php

namespace App\Enums;

enum BalanceTransactionType: string
{
    case TopUp = 'top_up';
    case Purchase = 'purchase';
    case Refund = 'refund';
    case Reservation = 'reservation';
    case ReservationRelease = 'reservation_release';
    case Adjustment = 'adjustment';

    public function label(): string
    {
        return match ($this) {
            self::TopUp => 'Top Up',
            self::Purchase => 'Purchase',
            self::Refund => 'Refund',
            self::Reservation => 'Reservation',
            self::ReservationRelease => 'Reservation Release',
            self::Adjustment => 'Adjustment',
        };
    }

    public function isCredit(): bool
    {
        // Adjustment can be credit or debit depending on amount sign
        return in_array($this, [self::TopUp, self::Refund, self::ReservationRelease]);
    }

    public function isDebit(): bool
    {
        // Adjustment can be credit or debit depending on amount sign
        return in_array($this, [self::Purchase, self::Reservation]);
    }

    public function isAdjustment(): bool
    {
        return $this === self::Adjustment;
    }
}
