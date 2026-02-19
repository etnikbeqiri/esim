<?php

namespace App\Enums;

enum SettingGroup: string
{
    case Emails = 'emails';
    case Analytics = 'analytics';
    case Invoices = 'invoices';
    case Homepage = 'homepage';
    case Payments = 'payments';

    public function label(): string
    {
        return match ($this) {
            self::Emails => 'Email Notifications',
            self::Analytics => 'Analytics',
            self::Invoices => 'Invoices & VAT',
            self::Homepage => 'Homepage',
            self::Payments => 'Payments',
        };
    }

    public function icon(): string
    {
        return match ($this) {
            self::Emails => 'Mail',
            self::Analytics => 'BarChart3',
            self::Invoices => 'Receipt',
            self::Homepage => 'Home',
            self::Payments => 'CreditCard',
        };
    }
}
