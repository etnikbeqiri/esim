<?php

namespace App\Services\Setting\Cache;

use App\Abstracts\Setting\AbstractCacheDriver;

class ArrayCacheDriver extends AbstractCacheDriver
{
    protected array $cache = [];

    protected array $expiry = [];

    public function get(string $key): mixed
    {
        $namespacedKey = $this->getNamespacedKey($key);

        if (!isset($this->cache[$namespacedKey])) {
            return null;
        }

        if ($this->isExpired($namespacedKey)) {
            $this->delete($key);

            return null;
        }

        return $this->cache[$namespacedKey];
    }

    public function set(string $key, mixed $value, ?int $ttl = null): bool
    {
        $namespacedKey = $this->getNamespacedKey($key);
        $ttl = $this->getTtl($ttl);

        $this->cache[$namespacedKey] = $value;
        $this->expiry[$namespacedKey] = $ttl > 0 ? time() + $ttl : null;

        return true;
    }

    public function has(string $key): bool
    {
        return $this->get($key) !== null;
    }

    public function delete(string $key): bool
    {
        $namespacedKey = $this->getNamespacedKey($key);

        unset($this->cache[$namespacedKey]);
        unset($this->expiry[$namespacedKey]);

        return true;
    }

    public function clear(): bool
    {
        $this->cache = [];
        $this->expiry = [];

        return true;
    }

    protected function isExpired(string $key): bool
    {
        $expiry = $this->expiry[$key] ?? null;

        if ($expiry === null) {
            return false;
        }

        return time() > $expiry;
    }
}
