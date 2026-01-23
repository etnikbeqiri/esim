<?php

namespace App\Services\Setting;

use App\Abstracts\Setting\AbstractSettingType;
use App\Contracts\Setting\SettingCacheContract;
use App\Contracts\Setting\SettingRepositoryContract;
use App\DTOs\Setting\SettingData;
use App\DTOs\Setting\SettingMetadata;
use App\Enums\SettingType;
use Illuminate\Support\Facades\Log;

class SettingsManager
{
    protected SettingRepositoryContract $repository;

    protected SettingCacheContract $cache;

    protected SettingsRegistrar $registrar;

    protected bool $cacheEnabled = true;

    protected ?int $cacheTtl = null;

    public function __construct(
        SettingRepositoryContract $repository,
        SettingCacheContract $cache,
        SettingsRegistrar $registrar
    ) {
        $this->repository = $repository;
        $this->cache = $cache;
        $this->registrar = $registrar;
    }

    /**
     * Get a setting value.
     */
    public function get(string $key, mixed $default = null): mixed
    {
        // Check cache first
        if ($this->cacheEnabled) {
            $cached = $this->cache->get($key);

            if ($cached !== null) {
                return $cached;
            }
        }

        // Get from repository
        $setting = $this->repository->get($key);

        // Get definition for type info
        $definition = $this->registrar->get($key);

        if (!$definition) {
            Log::warning("Setting '{$key}' is not registered");
            return $default;
        }

        $type = $definition->type;

        // Determine value
        $value = $setting !== null
            ? $type->fromStorage($setting['value'])
            : $definition->defaultValue;

        // Cast to type
        $value = $type->cast($value);

        // Cache the value
        if ($this->cacheEnabled) {
            $this->cache->set($key, $value, $this->cacheTtl);
        }

        return $value;
    }

    /**
     * Check if a setting is enabled (boolean helper).
     */
    public function enabled(string $key, bool $default = false): bool
    {
        return (bool) $this->get($key, $default);
    }

    /**
     * Set a setting value.
     */
    public function set(string $key, mixed $value): bool
    {
        // Get definition for validation and type info
        $definition = $this->registrar->get($key);

        if (!$definition) {
            Log::error("Cannot set unregistered setting '{$key}'");
            return false;
        }

        if ($definition->isReadOnly) {
            Log::warning("Cannot set read-only setting '{$key}'");
            return false;
        }

        // Validate the value
        if (!$definition->type->validate($value)) {
            Log::error("Invalid value for setting '{$key}'");
            return false;
        }

        // Convert to storage format
        $storageValue = $definition->type->toStorage($value);

        // Save to repository
        $success = $this->repository->set($key, $storageValue, $definition->type->value);

        if ($success) {
            // Clear cache
            $this->cache->delete($key);

            Log::info("Setting '{$key}' updated", ['value' => $value]);
        }

        return $success;
    }

    /**
     * Set multiple settings at once.
     */
    public function setMultiple(array $settings): bool
    {
        $toSave = [];

        foreach ($settings as $key => $value) {
            $definition = $this->registrar->get($key);

            if (!$definition || $definition->isReadOnly) {
                continue;
            }

            if (!$definition->type->validate($value)) {
                Log::warning("Invalid value for setting '{$key}', skipping");
                continue;
            }

            $toSave[$key] = [
                'value' => $definition->type->toStorage($value),
                'type' => $definition->type->value,
                'group' => $definition->group,
                'label' => $definition->label,
                'description' => $definition->description,
            ];

            // Clear cache
            $this->cache->delete($key);
        }

        if (empty($toSave)) {
            return false;
        }

        return $this->repository->setMultiple($toSave);
    }

    /**
     * Reset a setting to its default value.
     */
    public function reset(string $key): bool
    {
        $definition = $this->registrar->get($key);

        if (!$definition) {
            return false;
        }

        $success = $this->repository->delete($key);

        if ($success) {
            $this->cache->delete($key);
            Log::info("Setting '{$key}' reset to default");
        }

        return $success;
    }

    /**
     * Reset multiple settings to defaults.
     */
    public function resetMultiple(array $keys): bool
    {
        $success = true;

        foreach ($keys as $key) {
            if (!$this->reset($key)) {
                $success = false;
            }
        }

        return $success;
    }

    /**
     * Get all settings with their metadata.
     */
    public function all(): array
    {
        $stored = $this->repository->all()->keyBy('key');
        $registered = $this->registrar->all();

        $settings = [];

        foreach ($registered as $key => $definition) {
            $storedSetting = $stored->get($key);

            $hasCustomValue = $storedSetting !== null;
            $value = $hasCustomValue
                ? $definition->type->fromStorage($storedSetting->value)
                : $definition->defaultValue;

            $settings[$key] = [
                'key' => $key,
                'value' => $value,
                'default' => $definition->defaultValue,
                'is_default' => !$hasCustomValue,
                'type' => $definition->type->value,
                'group' => $definition->group,
                'label' => $definition->label,
                'description' => $definition->description,
                'encrypted' => $definition->isEncrypted,
                'read_only' => $definition->isReadOnly,
            ];
        }

        return $settings;
    }

    /**
     * Get settings grouped by category.
     */
    public function grouped(): array
    {
        $all = $this->all();

        $grouped = [];

        foreach ($all as $setting) {
            $grouped[$setting['group']][] = $setting;
        }

        return $grouped;
    }

    /**
     * Get all registered settings metadata.
     */
    public function getRegistry(): array
    {
        return $this->registrar->all();
    }

    /**
     * Check if a setting is registered.
     */
    public function has(string $key): bool
    {
        return $this->registrar->has($key);
    }

    /**
     * Clear all cached settings.
     */
    public function clearCache(): bool
    {
        return $this->cache->clear();
    }

    /**
     * Warm up cache with all settings.
     */
    public function warmCache(): bool
    {
        $all = $this->all();

        $cacheData = [];

        foreach ($all as $key => $setting) {
            $cacheData[$key] = $setting['value'];
        }

        return $this->cache->setMultiple($cacheData, $this->cacheTtl);
    }

    /**
     * Enable or disable caching.
     */
    public function setCacheEnabled(bool $enabled): self
    {
        $this->cacheEnabled = $enabled;

        return $this;
    }

    /**
     * Set cache TTL (time to live) in seconds.
     */
    public function setCacheTtl(?int $ttl): self
    {
        $this->cacheTtl = $ttl;

        return $this;
    }

    /**
     * Get the registrar instance.
     */
    public function getRegistrar(): SettingsRegistrar
    {
        return $this->registrar;
    }

    /**
     * Get the repository instance.
     */
    public function getRepository(): SettingRepositoryContract
    {
        return $this->repository;
    }

    /**
     * Get the cache instance.
     */
    public function getCache(): SettingCacheContract
    {
        return $this->cache;
    }
}
