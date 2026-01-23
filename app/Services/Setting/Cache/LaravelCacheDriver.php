<?php

namespace App\Services\Setting\Cache;

use App\Abstracts\Setting\AbstractCacheDriver;
use Illuminate\Support\Facades\Cache as LaravelCache;

class LaravelCacheDriver extends AbstractCacheDriver
{
    protected string $store = 'default';

    public function __construct(
        ?string $prefix = null,
        ?int $defaultTtl = null,
        ?string $store = null
    ) {
        parent::__construct($prefix, $defaultTtl);

        if ($store !== null) {
            $this->store = $store;
        }
    }

    /**
     * Get the cache instance (with or without store specification).
     */
    protected function cache()
    {
        return $this->store === 'default'
            ? LaravelCache::store()
            : LaravelCache::store($this->store);
    }

    public function get(string $key): mixed
    {
        return $this->cache()->get($this->getNamespacedKey($key));
    }

    public function set(string $key, mixed $value, ?int $ttl = null): bool
    {
        return $this->cache()->put(
            $this->getNamespacedKey($key),
            $value,
            $this->getTtl($ttl)
        );
    }

    public function has(string $key): bool
    {
        return $this->cache()->has($this->getNamespacedKey($key));
    }

    public function delete(string $key): bool
    {
        return $this->cache()->forget($this->getNamespacedKey($key));
    }

    public function clear(): bool
    {
        $prefix = $this->getNamespacedKey('');

        // Flush entire cache if using default store
        if ($this->store === 'default') {
            return $this->cache()->flush();
        }

        // Otherwise try to clear by prefix
        $keys = $this->cache()->getPrefix() . $prefix . '*';
        $this->cache()->forget($keys);

        return true;
    }

    public function getMultiple(array $keys): array
    {
        $namespacedKeys = array_map(fn($key) => $this->getNamespacedKey($key), $keys);
        $results = $this->cache()->many($namespacedKeys);

        $mapped = [];

        foreach ($keys as $key) {
            $mapped[$key] = $results[$this->getNamespacedKey($key)] ?? null;
        }

        return $mapped;
    }

    public function setMultiple(array $values, ?int $ttl = null): bool
    {
        $namespacedValues = [];

        foreach ($values as $key => $value) {
            $namespacedValues[$this->getNamespacedKey($key)] = $value;
        }

        return $this->cache()->putMany($namespacedValues, $this->getTtl($ttl));
    }
}
