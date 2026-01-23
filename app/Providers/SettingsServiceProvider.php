<?php

namespace App\Providers;

use App\Abstracts\Setting\AbstractCacheDriver;
use App\Contracts\Setting\SettingCacheContract;
use App\Contracts\Setting\SettingRepositoryContract;
use App\Repositories\Setting\SystemSettingRepository;
use App\Services\Setting\Cache\ArrayCacheDriver;
use App\Services\Setting\Cache\LaravelCacheDriver;
use App\Services\Setting\SettingsManager;
use App\Services\Setting\SettingsRegistrar;
use Illuminate\Support\ServiceProvider;

class SettingsServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Bind repository
        $this->app->bind(SettingRepositoryContract::class, SystemSettingRepository::class);

        // Bind cache driver based on environment
        $this->app->bind(SettingCacheContract::class, function ($app) {
            if ($app->environment('testing')) {
                return new ArrayCacheDriver('settings', 0);
            }

            // Use null for store to use Laravel's default cache
            return new LaravelCacheDriver('settings', 3600, null);
        });

        // Bind registrar as singleton (only needs to be created once)
        $this->app->singleton(SettingsRegistrar::class);

        // Bind manager as singleton
        $this->app->singleton(SettingsManager::class, function ($app) {
            return new SettingsManager(
                $app->make(SettingRepositoryContract::class),
                $app->make(SettingCacheContract::class),
                $app->make(SettingsRegistrar::class)
            );
        });

        // Alias for easier access
        $this->app->alias(SettingsManager::class, 'settings');
    }

    public function boot(): void
    {
        // Publish configuration if needed
        if ($this->app->runningInConsole()) {
            $this->publishes([
                __DIR__.'/../config/settings.php' => config_path('settings.php'),
            ], 'settings');
        }
    }
}
