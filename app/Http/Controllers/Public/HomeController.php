<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Country;
use App\Models\Package;
use App\Services\Setting\SettingsManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(): Response
    {
        $featuredPackages = $this->getFeaturedPackages();

        // Get featured countries with package counts
        $featuredCountries = Country::query()
            ->where('is_active', true)
            ->whereHas('packages', fn ($q) => $q->where('is_active', true))
            ->withCount(['packages' => fn ($q) => $q->where('is_active', true)])
            ->orderByDesc('packages_count')
            ->limit(8)
            ->get()
            ->map(function ($country) {
                // Calculate min effective price (considering custom prices)
                $minPrice = $country->packages()
                    ->where('is_active', true)
                    ->get()
                    ->min(fn ($p) => $p->effective_retail_price);

                return [
                    'id' => $country->id,
                    'name' => $country->name,
                    'iso_code' => $country->iso_code,
                    'package_count' => $country->packages_count,
                    'min_price' => $minPrice,
                ];
            });

        $totalCountries = Country::where('is_active', true)
            ->whereHas('packages', fn ($q) => $q->where('is_active', true))
            ->count();

        $totalPackages = Package::where('is_active', true)->count();

        return Inertia::render('welcome', [
            'featuredCountries' => $featuredCountries,
            'featuredPackages' => $featuredPackages,
            'totalCountries' => $totalCountries,
            'totalPackages' => $totalPackages,
        ]);
    }

    private function getFeaturedPackages(): array
    {
        $settings = app(SettingsManager::class);

        if (! $settings->enabled('homepage.show_featured_packages', true)) {
            return [];
        }

        $packageIdsString = $settings->get('homepage.featured_package_ids', '');
        if (empty($packageIdsString)) {
            return [];
        }

        // Parse package IDs with optional labels (format: ID|label or just ID)
        $packageEntries = array_filter(array_map('trim', explode(',', $packageIdsString)));
        $packageIds = [];
        $packageLabels = [];

        foreach ($packageEntries as $entry) {
            if (str_contains($entry, '|')) {
                [$id, $label] = explode('|', $entry, 2);
                $packageIds[] = (int) $id;
                $packageLabels[(int) $id] = $label;
            } else {
                $packageIds[] = (int) $entry;
            }
        }

        if (empty($packageIds)) {
            return [];
        }

        return Package::query()
            ->whereIn('id', $packageIds)
            ->where('is_active', true)
            ->with('country:id,name,iso_code')
            ->get()
            ->sortBy(fn ($pkg) => array_search($pkg->id, $packageIds))
            ->values()
            ->map(fn ($pkg) => [
                'id' => $pkg->id,
                'name' => $pkg->name,
                'data_mb' => $pkg->data_mb,
                'data_label' => $pkg->data_label,
                'validity_days' => $pkg->validity_days,
                'validity_label' => $pkg->validity_label,
                'retail_price' => $pkg->effective_retail_price,
                'country' => $pkg->country ? [
                    'name' => $pkg->country->name,
                    'iso_code' => $pkg->country->iso_code,
                ] : null,
                'badge_label' => $packageLabels[$pkg->id] ?? null,
            ])
            ->toArray();
    }

    public function destinations(Request $request): Response
    {
        $countries = Country::query()
            ->where('is_active', true)
            ->whereHas('packages', fn ($q) => $q->where('is_active', true))
            ->withCount(['packages' => fn ($q) => $q->where('is_active', true)])
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->when($request->region, function ($query, $region) {
                $query->where('region', $region);
            })
            ->orderBy('name')
            ->get()
            ->map(function ($country) {
                // Calculate min effective price (considering custom prices)
                $minPrice = $country->packages()
                    ->where('is_active', true)
                    ->get()
                    ->min(fn ($p) => $p->effective_retail_price);

                return [
                    'id' => $country->id,
                    'name' => $country->name,
                    'iso_code' => $country->iso_code,
                    'region' => $country->region,
                    'package_count' => $country->packages_count,
                    'min_price' => $minPrice,
                ];
            });

        // Get unique regions for filtering
        $regions = Country::query()
            ->where('is_active', true)
            ->whereHas('packages', fn ($q) => $q->where('is_active', true))
            ->distinct()
            ->pluck('region')
            ->filter()
            ->values();

        return Inertia::render('public/destinations', [
            'countries' => $countries,
            'regions' => $regions,
            'filters' => $request->only('search', 'region'),
        ]);
    }

    public function country(string $countryCode): Response
    {
        $country = Country::query()
            ->where('iso_code', strtoupper($countryCode))
            ->where('is_active', true)
            ->firstOrFail();

        $packages = Package::query()
            ->where('country_id', $country->id)
            ->where('is_active', true)
            ->orderBy('data_mb')
            ->orderByRaw('COALESCE(custom_retail_price, retail_price) ASC')
            ->get()
            ->map(fn ($package) => [
                'id' => $package->id,
                'name' => $package->name,
                'data_mb' => $package->data_mb,
                'data_label' => $package->data_label,
                'validity_days' => $package->validity_days,
                'validity_label' => $package->validity_label,
                'retail_price' => $package->effective_retail_price,
                'is_featured' => $package->is_featured,
                'is_popular' => $package->is_popular,
                'network_type' => $package->network_type,
                'sms_included' => $package->sms_included,
                'voice_included' => $package->voice_included,
                'hotspot_allowed' => $package->hotspot_allowed,
                'coverage_type' => $package->coverage_type,
                'description' => $package->description,
                'networks' => $package->supported_networks,
            ]);

        return Inertia::render('public/country', [
            'country' => [
                'id' => $country->id,
                'name' => $country->name,
                'iso_code' => $country->iso_code,
                'region' => $country->region,
            ],
            'packages' => $packages,
        ]);
    }

    public function package(Package $package): Response
    {
        if (! $package->is_active) {
            abort(404);
        }

        $package->load('country');

        return Inertia::render('public/package', [
            'package' => [
                'id' => $package->id,
                'name' => $package->name,
                'data_mb' => $package->data_mb,
                'data_label' => $package->data_label,
                'validity_days' => $package->validity_days,
                'validity_label' => $package->validity_label,
                'retail_price' => $package->effective_retail_price,
                'description' => $package->description,
                'country' => $package->country ? [
                    'name' => $package->country->name,
                    'iso_code' => $package->country->iso_code,
                ] : null,
            ],
        ]);
    }

    public function howItWorks(): Response
    {
        $totalCountries = Country::where('is_active', true)
            ->whereHas('packages', fn ($q) => $q->where('is_active', true))
            ->count();

        return Inertia::render('public/how-it-works', [
            'totalCountries' => $totalCountries,
        ]);
    }

    public function searchDestinations(Request $request): JsonResponse
    {
        $query = $request->get('q', '');

        if (strlen($query) < 2) {
            return response()->json([]);
        }

        $countries = Country::query()
            ->where('is_active', true)
            ->whereHas('packages', fn ($q) => $q->where('is_active', true))
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('iso_code', 'like', "%{$query}%");
            })
            ->withCount(['packages' => fn ($q) => $q->where('is_active', true)])
            ->orderByRaw('CASE WHEN name LIKE ? THEN 0 ELSE 1 END', ["{$query}%"])
            ->orderBy('name')
            ->limit(6)
            ->get()
            ->map(function ($country) {
                $minPrice = $country->packages()
                    ->where('is_active', true)
                    ->get()
                    ->min(fn ($p) => $p->effective_retail_price);

                return [
                    'id' => $country->id,
                    'name' => $country->name,
                    'iso_code' => $country->iso_code,
                    'package_count' => $country->packages_count,
                    'min_price' => $minPrice,
                ];
            });

        return response()->json($countries);
    }
}
