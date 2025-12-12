<?php

namespace App\Enums;

enum SyncJobType: string
{
    case SyncPackages = 'sync_packages';
    case SyncCountries = 'sync_countries';
    case SyncPricing = 'sync_pricing';
    case CheckStock = 'check_stock';
    case FullSync = 'full_sync';

    public function label(): string
    {
        return match ($this) {
            self::SyncPackages => 'Sync Packages',
            self::SyncCountries => 'Sync Countries',
            self::SyncPricing => 'Sync Pricing',
            self::CheckStock => 'Check Stock',
            self::FullSync => 'Full Sync',
        };
    }

    public function description(): string
    {
        return match ($this) {
            self::SyncPackages => 'Synchronize available eSIM packages from provider',
            self::SyncCountries => 'Synchronize supported countries from provider',
            self::SyncPricing => 'Update package pricing from provider',
            self::CheckStock => 'Check stock availability for packages',
            self::FullSync => 'Complete synchronization of all data',
        };
    }
}
