<?php

namespace App\Abstracts\Setting;

use App\Contracts\Setting\SettingCacheContract;

abstract class AbstractCacheDriver implements SettingCacheContract
{
    protected string $prefix = 'settings';

    protected int $defaultTtl = 3600; // 1 hour

    public function __construct(?string $prefix = null, ?int $defaultTtl = null)
    {
        if ($prefix !== null) {
            $this->prefix = $prefix;
        }

        if ($defaultTtl !== null) {
            $this->defaultTtl = $defaultTtl;
        }
    }

    public function getPrefix(): string
    {
        return $this->prefix;
    }

    public function getNamespacedKey(string $key): string
    {
        return $this->prefix . '.' . $key;
    }

    public function getMultiple(array $keys): array
    {
        $results = [];

        foreach ($keys as $key) {
            $results[$key] = $this->get($key);
        }

        return $results;
    }

    public function setMultiple(array $values, ?int $ttl = null): bool
    {
        $success = true;

        foreach ($values as $key => $value) {
            if (!$this->set($key, $value, $ttl)) {
                $success = false;
            }
        }

        return $success;
    }

    /**
     * Get the TTL (time to live) in seconds.
     */
    protected function getTtl(?int $ttl): int
    {
        return $ttl ?? $this->defaultTtl;
    }
}
