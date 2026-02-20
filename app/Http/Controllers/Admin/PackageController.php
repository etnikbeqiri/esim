<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Currency;
use App\Models\Package;
use App\Models\Provider;
use App\Models\Country;
use App\Services\Competitors\CompetitorPricingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PackageController extends Controller
{
    public function __construct(
        private CompetitorPricingService $competitorPricing,
    ) {}

    public function index(Request $request): Response
    {
        $sortableColumns = ['name', 'data_mb', 'validity_days', 'cost_price', 'retail_price', 'is_active', 'is_featured', 'created_at', 'provider', 'country'];
        $sortBy = in_array($request->sort_by, $sortableColumns) ? $request->sort_by : 'created_at';
        $sortDir = $request->sort_dir === 'asc' ? 'asc' : 'desc';
        $perPage = in_array((int) $request->per_page, [25, 50, 100, 200]) ? (int) $request->per_page : 50;

        $hasSearch = (bool) $request->search;
        $userChoseSort = $request->filled('sort_by');

        $query = Package::query()
            ->with(['provider:id,name', 'country:id,name,iso_code,is_active']);

        if ($hasSearch) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('packages.name', 'like', "%{$search}%")
                    ->orWhereHas('country', fn ($cq) => $cq->where('name', 'like', "%{$search}%"))
                    ->orWhereHas('provider', fn ($pq) => $pq->where('name', 'like', "%{$search}%"));
            });

            if (!$userChoseSort) {
                $query->selectRaw("packages.*, (
                    CASE
                        WHEN packages.name LIKE ? THEN 100
                        WHEN packages.name LIKE ? THEN 80
                        WHEN packages.name LIKE ? THEN 60
                        ELSE 0
                    END
                    + CASE
                        WHEN EXISTS(SELECT 1 FROM countries WHERE countries.id = packages.country_id AND countries.name LIKE ?) THEN 50
                        WHEN EXISTS(SELECT 1 FROM countries WHERE countries.id = packages.country_id AND countries.name LIKE ?) THEN 40
                        WHEN EXISTS(SELECT 1 FROM countries WHERE countries.id = packages.country_id AND countries.name LIKE ?) THEN 30
                        ELSE 0
                    END
                    + CASE
                        WHEN EXISTS(SELECT 1 FROM providers WHERE providers.id = packages.provider_id AND providers.name LIKE ?) THEN 20
                        WHEN EXISTS(SELECT 1 FROM providers WHERE providers.id = packages.provider_id AND providers.name LIKE ?) THEN 15
                        WHEN EXISTS(SELECT 1 FROM providers WHERE providers.id = packages.provider_id AND providers.name LIKE ?) THEN 10
                        ELSE 0
                    END
                ) as relevance_score", [
                    $search,
                    $search . '%',
                    '%' . $search . '%',
                    $search,
                    $search . '%',
                    '%' . $search . '%',
                    $search,
                    $search . '%',
                    '%' . $search . '%',
                ]);
            }
        }

        $query->when($request->provider_id, fn ($q, $id) => $q->where('provider_id', $id))
            ->when($request->country_id, fn ($q, $id) => $q->where('country_id', $id))
            ->when($request->has('is_active'), fn ($q) => $q->where('is_active', $request->boolean('is_active')))
            ->when($request->has('country_active'), fn ($q) => $q->whereHas('country', fn ($cq) => $cq->where('is_active', $request->boolean('country_active'))));

        if ($hasSearch && !$userChoseSort) {
            $query->orderByDesc('relevance_score');
        } elseif ($sortBy === 'provider') {
            $query->leftJoin('providers', 'packages.provider_id', '=', 'providers.id')
                ->orderBy('providers.name', $sortDir)
                ->select('packages.*');
        } elseif ($sortBy === 'country') {
            $query->leftJoin('countries', 'packages.country_id', '=', 'countries.id')
                ->orderBy('countries.name', $sortDir)
                ->select('packages.*');
        } else {
            $query->orderBy($sortBy, $sortDir);
        }

        $packages = $query->paginate($perPage)->withQueryString();

        // Make hidden fields visible for admin, strip relevance_score from response
        $packages->getCollection()->transform(function ($package) {
            $package->makeVisible(['cost_price', 'retail_price', 'custom_retail_price', 'provider_package_id']);
            unset($package->relevance_score);
            return $package;
        });

        // Bulk-match competitor pricing for all packages on this page
        $competitorPricing = $this->competitorPricing->matchForPackages($packages->getCollection());

        return Inertia::render('admin/packages/index', [
            'packages' => $packages,
            'providers' => Provider::select('id', 'name')->orderBy('name')->get(),
            'countries' => Country::select('id', 'name', 'iso_code', 'is_active')->orderBy('name')->get(),
            'filters' => $request->only('search', 'provider_id', 'country_id', 'is_active', 'country_active', 'sort_by', 'sort_dir', 'per_page'),
            'defaultCurrency' => Currency::getDefault(),
            'competitorPricing' => $competitorPricing,
        ]);
    }

    public function show(Package $package): Response
    {
        $package->load([
            'provider',
            'country',
            'sourceCurrency',
            'orders' => fn ($q) => $q->latest()->limit(10),
        ]);

        // Make hidden fields visible for admin
        $package->makeVisible(['cost_price', 'retail_price', 'custom_retail_price', 'provider_package_id', 'source_cost_price', 'source_currency_id']);

        $competitorPricing = $this->competitorPricing->findMatchingPlans(
            $package->country->iso_code ?? '',
            $package->data_mb,
            $package->validity_days,
        );

        return Inertia::render('admin/packages/show', [
            'package' => $package,
            'defaultCurrency' => Currency::getDefault(),
            'competitorPricing' => $competitorPricing,
        ]);
    }

    public function edit(Package $package): Response
    {
        $package->load(['provider', 'country', 'sourceCurrency']);

        // Make hidden fields visible for admin
        $package->makeVisible(['cost_price', 'retail_price', 'custom_retail_price', 'provider_package_id', 'source_cost_price', 'source_currency_id']);

        $competitorPricing = $this->competitorPricing->findMatchingPlans(
            $package->country->iso_code ?? '',
            $package->data_mb,
            $package->validity_days,
        );

        return Inertia::render('admin/packages/edit', [
            'package' => $package,
            'defaultCurrency' => Currency::getDefault(),
            'competitorPricing' => $competitorPricing,
        ]);
    }

    public function update(Request $request, Package $package): RedirectResponse
    {
        $validated = $request->validate([
            'custom_retail_price' => ['nullable', 'numeric', 'min:0'],
            'is_active' => ['boolean'],
            'is_featured' => ['boolean'],
            'show_on_homepage' => ['boolean'],
            'featured_order' => ['nullable', 'integer', 'min:0'],
            'featured_label' => ['nullable', 'string', 'in:featured,best_value,popular,hot_deal'],
        ]);

        // Handle empty strings as null
        if (isset($validated['custom_retail_price']) && $validated['custom_retail_price'] === '') {
            $validated['custom_retail_price'] = null;
        }
        if (isset($validated['featured_label']) && $validated['featured_label'] === '') {
            $validated['featured_label'] = null;
        }

        // Clear homepage carousel fields when removing from homepage
        if (!($validated['show_on_homepage'] ?? true)) {
            $validated['featured_label'] = null;
            $validated['featured_order'] = 0;
        }

        $package->update($validated);

        return redirect()->route('admin.packages.show', $package)
            ->with('success', 'Package updated successfully.');
    }

    public function bulkActivate(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:packages,id'],
        ]);

        Package::whereIn('id', $validated['ids'])->update(['is_active' => true]);

        return back()->with('success', count($validated['ids']) . ' packages activated.');
    }

    public function bulkDeactivate(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:packages,id'],
        ]);

        Package::whereIn('id', $validated['ids'])->update(['is_active' => false]);

        return back()->with('success', count($validated['ids']) . ' packages deactivated.');
    }

    public function toggleFeatured(Package $package): RedirectResponse
    {
        $package->update(['is_featured' => !$package->is_featured]);

        $status = $package->is_featured ? 'featured' : 'unfeatured';
        return back()->with('success', "Package {$status} successfully.");
    }

    public function toggleActive(Package $package): RedirectResponse
    {
        $package->update(['is_active' => !$package->is_active]);

        $status = $package->is_active ? 'activated' : 'deactivated';
        return back()->with('success', "Package {$status} successfully.");
    }

    public function refreshCompetitorPricing(): RedirectResponse
    {
        $this->competitorPricing->refreshCache();

        return back()->with('success', 'Competitor pricing cache refreshed.');
    }
}
