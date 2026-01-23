<?php

namespace App\Contracts\Setting;

use Illuminate\Database\Eloquent\Collection;

interface SettingRepositoryContract
{
    /**
     * Get all settings from storage.
     */
    public function all(): Collection;

    /**
     * Get a setting by key.
     */
    public function get(string $key): ?array;

    /**
     * Check if a setting exists in storage.
     */
    public function exists(string $key): bool;

    /**
     * Set a setting value.
     */
    public function set(string $key, string $value, string $type): bool;

    /**
     * Delete a setting.
     */
    public function delete(string $key): bool;

    /**
     * Get settings by group.
     */
    public function getByGroup(string $group): Collection;

    /**
     * Clear all settings.
     */
    public function clear(): bool;

    /**
     * Get multiple settings by keys.
     */
    public function getMultiple(array $keys): array;
}
