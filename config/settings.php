<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Settings Cache Driver
    |--------------------------------------------------------------------------
    |
    | The driver to use for caching settings. Options:
    | - 'array': In-memory cache (for testing)
    | - 'laravel': Uses Laravel's cache facade
    |
    */

    'cache_driver' => env('SETTINGS_CACHE_DRIVER', 'laravel'),

    /*
    |--------------------------------------------------------------------------
    | Cache TTL
    |--------------------------------------------------------------------------
    |
    | How long settings should be cached (in seconds).
    | Set to null for indefinite caching.
    |
    */

    'cache_ttl' => env('SETTINGS_CACHE_TTL', 3600),

    /*
    |--------------------------------------------------------------------------
    | Cache Prefix
    |--------------------------------------------------------------------------
    |
    | The prefix to use for cached settings keys.
    |
    */

    'cache_prefix' => env('SETTINGS_CACHE_PREFIX', 'settings'),

    /*
    |--------------------------------------------------------------------------
    | Auto-Warm Cache
    |--------------------------------------------------------------------------
    |
    | Whether to automatically warm the cache on application boot.
    |
    */

    'auto_warm_cache' => env('SETTINGS_AUTO_WARM_CACHE', false),
];
