<?php

namespace App\Enums;

enum SettingGroup: string
{
    case Emails = 'emails';
    case Analytics = 'analytics';
    case Invoices = 'invoices';

    public function label(): string
    {
        return match ($this) {
            self::Emails => 'Email Notifications',
            self::Analytics => 'Analytics',
            self::Invoices => 'Invoices & VAT',
        };
    }

    public function icon(): string
    {
        return match ($this) {
            self::Emails => 'Mail',
            self::Analytics => 'BarChart3',
            self::Invoices => 'Receipt',
        };
    }
}
