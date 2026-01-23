<?php

use App\Services\Setting\SettingsManager;
use Illuminate\Support\Facades\App;

if (!function_exists('setting')) {
    /**
     * Get or set a system setting.
     *
     * @param string|null $key Setting key. If null, returns SettingsManager instance.
     * @param mixed $default Default value if key doesn't exist.
     * @return mixed|SettingsManager
     */
    function setting(?string $key = null, mixed $default = null): mixed
    {
        $manager = App::make(SettingsManager::class);

        if ($key === null) {
            return $manager;
        }

        return $manager->get($key, $default);
    }
}

if (!function_exists('setting_enabled')) {
    /**
     * Check if a boolean setting is enabled.
     */
    function setting_enabled(string $key, bool $default = false): bool
    {
        return setting($key, $default);
    }
}

if (!function_exists('settings_grouped')) {
    /**
     * Get all settings grouped by category.
     */
    function settings_grouped(): array
    {
        return setting()->grouped();
    }
}
