<?php

namespace App\Enums;

enum InvoiceStatus: string
{
    case Draft = 'draft';
    case Issued = 'issued';
    case Paid = 'paid';
    case Voided = 'voided';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Draft',
            self::Issued => 'Issued',
            self::Paid => 'Paid',
            self::Voided => 'Voided',
        };
    }

    public function color(): string
    {
        return match ($this) {
            self::Draft => 'gray',
            self::Issued => 'blue',
            self::Paid => 'green',
            self::Voided => 'red',
        };
    }

    public function isFinal(): bool
    {
        return in_array($this, [self::Paid, self::Voided]);
    }
}
