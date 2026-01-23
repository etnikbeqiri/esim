<?php

namespace App\Services\Setting;

use Illuminate\Support\Facades\Cache as LaravelCache;

class CacheFactory
{
    /**
     * Create a cache driver instance.
     */
    public static function make(string $driver = null, ?string $prefix = null, ?int $ttl = null): object
    {
        $driver = $driver ?? config('settings.cache_driver', 'laravel');
        $prefix = $prefix ?? config('settings.cache_prefix', 'settings');
        $ttl = $ttl ?? config('settings.cache_ttl', 3600);

        return match ($driver) {
            'array' => new Cache\ArrayCacheDriver($prefix, $ttl),
            'laravel' => new Cache\LaravelCacheDriver($prefix, $ttl),
            default => new Cache\LaravelCacheDriver($prefix, $ttl),
        };
    }
}
