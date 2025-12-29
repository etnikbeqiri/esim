<?php

namespace App\Enums;

enum InvoiceType: string
{
    case TopUp = 'top_up';
    case Purchase = 'purchase';
    case Statement = 'statement';

    public function label(): string
    {
        return match ($this) {
            self::TopUp => 'Balance Top-Up Invoice',
            self::Purchase => 'Purchase Invoice',
            self::Statement => 'Account Statement',
        };
    }

    public function shortLabel(): string
    {
        return match ($this) {
            self::TopUp => 'Top-Up',
            self::Purchase => 'Purchase',
            self::Statement => 'Statement',
        };
    }

    public function prefix(): string
    {
        return match ($this) {
            self::TopUp => 'INV',
            self::Purchase => 'INV',
            self::Statement => 'STM',
        };
    }
}
