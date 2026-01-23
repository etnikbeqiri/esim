<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Setting\SettingsManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SystemSettingController extends Controller
{
    public function __construct(
        protected SettingsManager $settings
    ) {}

    public function index(): Response
    {
        return Inertia::render('admin/settings/system', [
            'settings' => $this->settings->grouped(),
            'groups' => collect($this->settings->getRegistry())
                ->groupBy(fn($setting) => $setting->group)
                ->map(function ($settings, $group) {
                    return [
                        'value' => $group,
                        'label' => \App\Enums\SettingGroup::from($group)->label(),
                        'icon' => \App\Enums\SettingGroup::from($group)->icon(),
                    ];
                })
                ->values(),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'settings' => ['required', 'array'],
            'settings.*' => ['present'],
        ]);

        $this->settings->setMultiple($validated['settings']);

        return back()->with('success', 'Settings updated successfully.');
    }

    public function reset(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'keys' => ['required', 'array'],
            'keys.*' => ['required', 'string'],
        ]);

        $this->settings->resetMultiple($validated['keys']);

        return back()->with('success', 'Settings reset to defaults.');
    }

    public function clearCache(Request $request): RedirectResponse
    {
        $this->settings->clearCache();

        return back()->with('success', 'Settings cache cleared.');
    }

    public function warmCache(Request $request): RedirectResponse
    {
        $this->settings->warmCache();

        return back()->with('success', 'Settings cache warmed.');
    }
}
