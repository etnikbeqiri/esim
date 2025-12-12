<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Country;
use App\Models\Currency;
use App\Models\Package;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CountryController extends Controller
{
    public function index(Request $request): Response
    {
        $countries = Country::query()
            ->withCount(['packages', 'packages as active_packages_count' => fn ($q) => $q->where('is_active', true)])
            ->when($request->search, fn ($q, $search) => $q->where('name', 'like', "%{$search}%"))
            ->when($request->region, fn ($q, $region) => $q->where('region', $region))
            ->when($request->has('is_active'), fn ($q) => $q->where('is_active', $request->boolean('is_active')))
            ->orderBy('name')
            ->paginate(50)
            ->withQueryString();

        $regions = Country::select('region')->distinct()->pluck('region')->filter()->sort()->values();

        return Inertia::render('admin/countries/index', [
            'countries' => $countries,
            'regions' => $regions,
            'filters' => $request->only('search', 'region', 'is_active'),
        ]);
    }

    public function show(Country $country): Response
    {
        $country->loadCount(['packages', 'packages as active_packages_count' => fn ($q) => $q->where('is_active', true)]);

        $packages = $country->packages()
            ->with(['provider:id,name'])
            ->orderByDesc('is_active')
            ->orderBy('name')
            ->paginate(50);

        return Inertia::render('admin/countries/show', [
            'country' => $country,
            'packages' => $packages,
            'defaultCurrency' => Currency::getDefault(),
        ]);
    }

    public function toggleActive(Country $country): RedirectResponse
    {
        $newStatus = !$country->is_active;
        $country->update(['is_active' => $newStatus]);

        // When disabling a country, also disable all its packages
        if (!$newStatus) {
            $packagesCount = $country->packages()->where('is_active', true)->count();
            $country->packages()->update(['is_active' => false]);
            $status = "disabled (along with {$packagesCount} packages)";
        } else {
            $status = 'enabled';
        }

        return back()->with('success', "Country {$status} successfully.");
    }

    public function bulkActivate(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:countries,id'],
        ]);

        Country::whereIn('id', $validated['ids'])->update(['is_active' => true]);
        // Note: We don't auto-enable packages - admin should manually enable desired packages

        return back()->with('success', count($validated['ids']) . ' countries enabled.');
    }

    public function bulkDeactivate(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:countries,id'],
        ]);

        // Disable countries
        Country::whereIn('id', $validated['ids'])->update(['is_active' => false]);

        // Also disable all packages in those countries
        $packagesCount = Package::whereIn('country_id', $validated['ids'])
            ->where('is_active', true)
            ->count();
        Package::whereIn('country_id', $validated['ids'])->update(['is_active' => false]);

        return back()->with('success', count($validated['ids']) . " countries disabled (along with {$packagesCount} packages).");
    }

    /**
     * Sync packages with disabled countries - disable packages for all disabled countries.
     */
    public function syncDisabledCountries(): RedirectResponse
    {
        $disabledCountryIds = Country::where('is_active', false)->pluck('id');

        $packagesCount = Package::whereIn('country_id', $disabledCountryIds)
            ->where('is_active', true)
            ->count();

        Package::whereIn('country_id', $disabledCountryIds)->update(['is_active' => false]);

        return back()->with('success', "Synced {$packagesCount} packages with disabled countries.");
    }
}
