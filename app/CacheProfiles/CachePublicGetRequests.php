<?php

namespace App\CacheProfiles;

use Illuminate\Http\Request;
use Spatie\ResponseCache\CacheProfiles\CacheProfile;
use Symfony\Component\HttpFoundation\Response;

class CachePublicGetRequests implements CacheProfile
{
    public function enabled(Request $request): bool
    {
        return true;
    }

    public function shouldCacheRequest(Request $request): bool
    {
        // Only cache GET requests
        if (!$request->isMethod('GET')) {
            return false;
        }

        // Don't cache authenticated requests
        if ($request->user()) {
            return false;
        }

        // Don't cache API routes
        if ($request->is('api/*')) {
            return false;
        }

        return true;
    }

    public function shouldCacheResponse(Response $response): bool
    {
        // Cache all successful responses (200-399)
        return $response->isSuccessful() || $response->isRedirect();
    }

    public function cacheLifetimeInSeconds(Request $request): int
    {
        return 300; // 5 minutes
    }

    public function useCacheNameSuffix(Request $request): string
    {
        return '';
    }
}
