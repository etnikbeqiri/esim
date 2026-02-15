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

        return Package::query()
            ->where('show_on_homepage', true)
            ->where('is_active', true)
            ->with('country:id,name,iso_code')
            ->orderBy('featured_order')
            ->get()
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
                'badge_label' => $pkg->featured_label,
            ])
            ->toArray();
    }

    public function destinations(Request $request): Response
    {
        $search = $request->search;

        $query = Country::query()
            ->where('is_active', true)
            ->whereHas('packages', fn ($q) => $q->where('is_active', true))
            ->withCount(['packages' => fn ($q) => $q->where('is_active', true)]);

        if ($search) {
            $query->selectRaw("countries.*, (
                CASE
                    WHEN countries.name LIKE ? THEN 100
                    WHEN countries.name LIKE ? THEN 80
                    WHEN countries.name LIKE ? THEN 60
                    ELSE 0
                END
                + CASE
                    WHEN countries.iso_code LIKE ? THEN 70
                    WHEN countries.iso_code LIKE ? THEN 50
                    ELSE 0
                END
                + CASE
                    WHEN countries.region LIKE ? THEN 30
                    WHEN countries.region LIKE ? THEN 20
                    ELSE 0
                END
                + CASE
                    WHEN EXISTS(SELECT 1 FROM packages WHERE packages.country_id = countries.id AND packages.is_active = 1 AND (packages.name LIKE ? OR packages.description LIKE ?)) THEN 15
                    ELSE 0
                END
            ) as relevance_score", [
                $search,
                $search . '%',
                '%' . $search . '%',
                $search,
                $search . '%',
                $search . '%',
                '%' . $search . '%',
                '%' . $search . '%',
                '%' . $search . '%',
            ]);

            $query->where(function ($q) use ($search) {
                $q->where('countries.name', 'like', "%{$search}%")
                    ->orWhere('countries.iso_code', 'like', "%{$search}%")
                    ->orWhere('countries.region', 'like', "%{$search}%")
                    ->orWhereHas('packages', fn ($pq) => $pq
                        ->where('is_active', true)
                        ->where(function ($inner) use ($search) {
                            $inner->where('name', 'like', "%{$search}%")
                                ->orWhere('description', 'like', "%{$search}%");
                        })
                    );
            });

            $query->orderByDesc('relevance_score')->orderBy('countries.name');
        } else {
            $query->orderBy('name');
        }

        if ($request->region) {
            $query->where('region', $request->region);
        }

        $countries = $query->get()->map(function ($country) {
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

        // Find regional bundles that include this country
        $regionalBundles = Package::query()
            ->where('coverage_type', 'regional')
            ->where('is_active', true)
            ->whereJsonContains('coverage_countries', $country->name)
            ->with('country:id,name,iso_code')
            ->orderBy('data_mb')
            ->orderByRaw('COALESCE(custom_retail_price, retail_price) ASC')
            ->get()
            ->groupBy(fn ($pkg) => $pkg->country?->name ?? 'Other')
            ->map(function ($packages, $regionName) {
                $firstPkg = $packages->first();
                $regionCountry = $firstPkg->country;

                // Score each package to find the best ones to preview
                $maxData = $packages->max('data_mb') ?: 1;
                $maxValidity = $packages->max('validity_days') ?: 1;
                $prices = $packages->map(fn ($p) => (float) $p->effective_retail_price);
                $maxPrice = $prices->max() ?: 1;
                $minPrice = $prices->min() ?: 0;
                $priceRange = max($maxPrice - $minPrice, 1);

                $scored = $packages->map(function ($pkg) use ($maxData, $maxValidity, $minPrice, $priceRange) {
                    $price = (float) $pkg->effective_retail_price;
                    $dataGb = $pkg->data_mb / 1024;
                    $score = 0;

                    // Value score (price per GB, lower = better) — weight: 30
                    $pricePerGb = $dataGb > 0 ? $price / $dataGb : 999;
                    $score += max(0, 30 - ($pricePerGb * 2));

                    // Data amount score (more data = better) — weight: 25
                    $score += ($pkg->data_mb / $maxData) * 25;

                    // Validity score (longer = better) — weight: 15
                    $score += ($pkg->validity_days / $maxValidity) * 15;

                    // Penalize tiny plans (< 1 GB) — weight: -15
                    if ($pkg->data_mb < 1024) {
                        $score -= 15;
                    }

                    // Penalize very short plans (1 day) — weight: -10
                    if ($pkg->validity_days <= 1) {
                        $score -= 10;
                    }

                    // Bonus for featured/popular — weight: 10
                    if ($pkg->is_featured || $pkg->is_popular) {
                        $score += 10;
                    }

                    // Mid-range price bonus (not cheapest junk, not most expensive) — weight: 10
                    $priceNorm = ($price - $minPrice) / $priceRange;
                    $score += (1 - abs($priceNorm - 0.4)) * 10;

                    $pkg->_preview_score = $score;

                    return $pkg;
                });

                // Pick top 4 by score, then sort by data for display
                $preview = $scored->sortByDesc('_preview_score')
                    ->unique(fn ($p) => match (true) {
                        $p->data_mb <= 1024  => 'small',
                        $p->data_mb <= 3072  => 'medium',
                        $p->data_mb <= 10240 => 'large',
                        default              => 'xl',
                    })
                    ->take(4)
                    ->sortBy('data_mb')
                    ->values();

                return [
                    'region_name' => $regionName,
                    'region_iso' => $regionCountry?->iso_code,
                    'country_count' => is_array($firstPkg->coverage_countries) ? count($firstPkg->coverage_countries) : 0,
                    'packages' => $preview->map(fn ($pkg) => [
                        'id' => $pkg->id,
                        'name' => $pkg->name,
                        'data_mb' => $pkg->data_mb,
                        'data_label' => $pkg->data_label,
                        'validity_days' => $pkg->validity_days,
                        'validity_label' => $pkg->validity_label,
                        'retail_price' => $pkg->effective_retail_price,
                    ])->values()->toArray(),
                    'total_count' => $packages->count(),
                    'min_price' => $packages->min(fn ($p) => $p->effective_retail_price),
                ];
            })
            ->values()
            ->toArray();

        return Inertia::render('public/country', [
            'country' => [
                'id' => $country->id,
                'name' => $country->name,
                'iso_code' => $country->iso_code,
                'region' => $country->region,
            ],
            'packages' => $packages,
            'regionalBundles' => $regionalBundles,
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
        $search = $request->get('q', '');

        if (strlen($search) < 2) {
            return response()->json([]);
        }

        $countries = Country::query()
            ->selectRaw("countries.*, (
                CASE
                    WHEN countries.name LIKE ? THEN 100
                    WHEN countries.name LIKE ? THEN 80
                    WHEN countries.name LIKE ? THEN 60
                    ELSE 0
                END
                + CASE
                    WHEN countries.iso_code LIKE ? THEN 70
                    WHEN countries.iso_code LIKE ? THEN 50
                    ELSE 0
                END
                + CASE
                    WHEN countries.region LIKE ? THEN 30
                    WHEN countries.region LIKE ? THEN 20
                    ELSE 0
                END
                + CASE
                    WHEN EXISTS(SELECT 1 FROM packages WHERE packages.country_id = countries.id AND packages.is_active = 1 AND (packages.name LIKE ? OR packages.description LIKE ?)) THEN 15
                    ELSE 0
                END
            ) as relevance_score", [
                $search,
                $search . '%',
                '%' . $search . '%',
                $search,
                $search . '%',
                $search . '%',
                '%' . $search . '%',
                '%' . $search . '%',
                '%' . $search . '%',
            ])
            ->where('is_active', true)
            ->whereHas('packages', fn ($q) => $q->where('is_active', true))
            ->where(function ($q) use ($search) {
                $q->where('countries.name', 'like', "%{$search}%")
                    ->orWhere('countries.iso_code', 'like', "%{$search}%")
                    ->orWhere('countries.region', 'like', "%{$search}%")
                    ->orWhereHas('packages', fn ($pq) => $pq
                        ->where('is_active', true)
                        ->where(function ($inner) use ($search) {
                            $inner->where('name', 'like', "%{$search}%")
                                ->orWhere('description', 'like', "%{$search}%");
                        })
                    );
            })
            ->withCount(['packages' => fn ($q) => $q->where('is_active', true)])
            ->orderByDesc('relevance_score')
            ->orderBy('countries.name')
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
