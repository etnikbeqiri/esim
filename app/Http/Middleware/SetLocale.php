<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    protected array $supportedLocales = ['en', 'de', 'sq'];

    private const COUNTRY_TO_LOCALE = [
        'AL' => 'sq',
        'XK' => 'sq',
        'RS' => 'sq',
        'DE' => 'de',
        'AT' => 'de',
        'CH' => 'de',
    ];

    private ?string $geoDetectedLocale = null;

    public function handle(Request $request, Closure $next): Response
    {
        $locale = $this->determineLocale($request);
        App::setLocale($locale);

        $response = $next($request);

        // If locale was geo-detected, persist it as a cookie so
        // subsequent requests hit step 3 and skip the API call
        if ($this->geoDetectedLocale !== null) {
            $response->withCookie(cookie('locale', $this->geoDetectedLocale, 60 * 24 * 365));
        }

        return $response;
    }

    protected function determineLocale(Request $request): string
    {
        // 1. Check authenticated user's preference
        if ($user = $request->user()) {
            $userLocale = $user->preferred_language;
            if ($userLocale && in_array($userLocale, $this->supportedLocales)) {
                return $userLocale;
            }
        }

        // 2. Check session for guest preference
        if ($sessionLocale = session('locale')) {
            if (in_array($sessionLocale, $this->supportedLocales)) {
                return $sessionLocale;
            }
        }

        // 3. Check cookie for guest preference
        if ($cookieLocale = $request->cookie('locale')) {
            if (in_array($cookieLocale, $this->supportedLocales)) {
                return $cookieLocale;
            }
        }

        // 4. Detect locale from IP geolocation (guests with no prior choice)
        $geoLocale = $this->detectLocaleFromIp($request);
        if ($geoLocale) {
            return $geoLocale;
        }

        // 5. Check browser Accept-Language header
        $browserLocale = $request->getPreferredLanguage($this->supportedLocales);
        if ($browserLocale && in_array($browserLocale, $this->supportedLocales)) {
            return $browserLocale;
        }

        // 6. Fallback to config default
        return config('app.locale', 'en');
    }

    protected function detectLocaleFromIp(Request $request): ?string
    {
        $ip = $request->ip();

        if ($this->isPrivateIp($ip)) {
            return null;
        }

        $cacheKey = "geo_locale_{$ip}";
        $cached = Cache::get($cacheKey);

        if ($cached !== null) {
            // false sentinel = API succeeded but country has no special locale
            return $cached === false ? null : $cached;
        }

        try {
            $response = Http::timeout(3)->get("http://ip-api.com/json/{$ip}");

            if ($response->successful()) {
                $data = $response->json();

                if (($data['status'] ?? null) === 'success') {
                    $countryCode = $data['countryCode'] ?? null;
                    $locale = self::COUNTRY_TO_LOCALE[$countryCode] ?? null;

                    // Cache for 30 days (false sentinel for unmapped countries)
                    Cache::put($cacheKey, $locale ?? false, now()->addDays(30));

                    if ($locale) {
                        session(['locale' => $locale]);
                        $this->geoDetectedLocale = $locale;

                        return $locale;
                    }

                    return null;
                }
            }
        } catch (\Exception $e) {
            // API down or timeout — don't cache, fall through gracefully
        }

        return null;
    }

    private function isPrivateIp(string $ip): bool
    {
        return in_array($ip, ['127.0.0.1', '::1'])
            || filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) === false;
    }
}
