<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Country;
use App\Models\Package;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(): Response
    {
        // Get featured countries with package counts and min prices
        $featuredCountries = Country::query()
            ->where('is_active', true)
            ->whereHas('packages', fn ($q) => $q->where('is_active', true))
            ->withCount(['packages' => fn ($q) => $q->where('is_active', true)])
            ->withMin(['packages' => fn ($q) => $q->where('is_active', true)], 'retail_price')
            ->orderByDesc('packages_count')
            ->limit(8)
            ->get()
            ->map(fn ($country) => [
                'id' => $country->id,
                'name' => $country->name,
                'iso_code' => $country->iso_code,
                'package_count' => $country->packages_count,
                'min_price' => $country->packages_min_retail_price,
            ]);

        $totalCountries = Country::where('is_active', true)
            ->whereHas('packages', fn ($q) => $q->where('is_active', true))
            ->count();

        $totalPackages = Package::where('is_active', true)->count();

        return Inertia::render('welcome', [
            'featuredCountries' => $featuredCountries,
            'totalCountries' => $totalCountries,
            'totalPackages' => $totalPackages,
        ]);
    }

    public function destinations(Request $request): Response
    {
        $countries = Country::query()
            ->where('is_active', true)
            ->whereHas('packages', fn ($q) => $q->where('is_active', true))
            ->withCount(['packages' => fn ($q) => $q->where('is_active', true)])
            ->withMin(['packages' => fn ($q) => $q->where('is_active', true)], 'retail_price')
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->when($request->region, function ($query, $region) {
                $query->where('region', $region);
            })
            ->orderBy('name')
            ->get()
            ->map(fn ($country) => [
                'id' => $country->id,
                'name' => $country->name,
                'iso_code' => $country->iso_code,
                'region' => $country->region,
                'package_count' => $country->packages_count,
                'min_price' => $country->packages_min_retail_price,
            ]);

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
            ->orderBy('retail_price')
            ->get()
            ->map(fn ($package) => [
                'id' => $package->id,
                'name' => $package->name,
                'data_mb' => $package->data_mb,
                'data_label' => $package->data_label,
                'validity_days' => $package->validity_days,
                'validity_label' => $package->validity_label,
                'retail_price' => $package->retail_price,
                'is_featured' => $package->is_featured,
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
        if (!$package->is_active) {
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
                'retail_price' => $package->retail_price,
                'description' => $package->description,
                'country' => $package->country ? [
                    'name' => $package->country->name,
                    'iso_code' => $package->country->iso_code,
                ] : null,
            ],
        ]);
    }
}
