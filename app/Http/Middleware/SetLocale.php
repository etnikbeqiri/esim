<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    protected array $supportedLocales = ['en', 'de', 'sq'];

    public function handle(Request $request, Closure $next): Response
    {
        $locale = $this->determineLocale($request);
        App::setLocale($locale);

        return $next($request);
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

        // 4. Fallback to config default
        return config('app.locale', 'en');
    }
}
