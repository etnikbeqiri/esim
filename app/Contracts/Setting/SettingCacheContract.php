<?php

namespace App\Contracts\Setting;

interface SettingCacheContract
{
    /**
     * Get a value from cache.
     */
    public function get(string $key): mixed;

    /**
     * Set a value in cache.
     */
    public function set(string $key, mixed $value, ?int $ttl = null): bool;

    /**
     * Check if a key exists in cache.
     */
    public function has(string $key): bool;

    /**
     * Delete a value from cache.
     */
    public function delete(string $key): bool;

    /**
     * Clear all cached settings.
     */
    public function clear(): bool;

    /**
     * Get multiple values from cache.
     */
    public function getMultiple(array $keys): array;

    /**
     * Set multiple values in cache.
     */
    public function setMultiple(array $values, ?int $ttl = null): bool;

    /**
     * Get the cache prefix.
     */
    public function getPrefix(): string;

    /**
     * Get a namespaced cache key.
     */
    public function getNamespacedKey(string $key): string;
}
