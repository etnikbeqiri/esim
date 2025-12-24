<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LanguageController extends Controller
{
    protected array $supportedLocales = ['en', 'de', 'sq'];

    public function edit(): Response
    {
        return Inertia::render('settings/language');
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'language' => ['required', 'string', 'in:' . implode(',', $this->supportedLocales)],
        ]);

        $request->user()->update([
            'preferred_language' => $validated['language'],
        ]);

        session(['locale' => $validated['language']]);

        return back();
    }

    public function setLocale(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'locale' => ['required', 'string', 'in:' . implode(',', $this->supportedLocales)],
        ]);

        $locale = $validated['locale'];

        session(['locale' => $locale]);

        // If user is authenticated, also save to their profile
        if ($user = $request->user()) {
            $user->update(['preferred_language' => $locale]);
        }

        return back()->withCookie(cookie('locale', $locale, 60 * 24 * 365));
    }
}
