<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Currency;
use App\Models\Package;
use App\Models\Provider;
use App\Models\Country;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PackageController extends Controller
{
    public function index(Request $request): Response
    {
        $packages = Package::query()
            ->with(['provider:id,name', 'country:id,name,iso_code,is_active'])
            ->when($request->search, fn ($q, $search) => $q->where('name', 'like', "%{$search}%"))
            ->when($request->provider_id, fn ($q, $id) => $q->where('provider_id', $id))
            ->when($request->country_id, fn ($q, $id) => $q->where('country_id', $id))
            ->when($request->has('is_active'), fn ($q) => $q->where('is_active', $request->boolean('is_active')))
            ->when($request->has('country_active'), fn ($q) => $q->whereHas('country', fn ($cq) => $cq->where('is_active', $request->boolean('country_active'))))
            ->orderByDesc('created_at')
            ->paginate(50)
            ->withQueryString();

        // Make hidden fields visible for admin
        $packages->getCollection()->transform(function ($package) {
            return $package->makeVisible(['cost_price', 'retail_price', 'custom_retail_price', 'provider_package_id']);
        });

        return Inertia::render('admin/packages/index', [
            'packages' => $packages,
            'providers' => Provider::select('id', 'name')->orderBy('name')->get(),
            'countries' => Country::select('id', 'name', 'iso_code', 'is_active')->orderBy('name')->get(),
            'filters' => $request->only('search', 'provider_id', 'country_id', 'is_active', 'country_active'),
            'defaultCurrency' => Currency::getDefault(),
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

        return Inertia::render('admin/packages/show', [
            'package' => $package,
            'defaultCurrency' => Currency::getDefault(),
        ]);
    }

    public function edit(Package $package): Response
    {
        $package->load(['provider', 'country', 'sourceCurrency']);

        // Make hidden fields visible for admin
        $package->makeVisible(['cost_price', 'retail_price', 'custom_retail_price', 'provider_package_id', 'source_cost_price', 'source_currency_id']);

        return Inertia::render('admin/packages/edit', [
            'package' => $package,
            'defaultCurrency' => Currency::getDefault(),
        ]);
    }

    public function update(Request $request, Package $package): RedirectResponse
    {
        $validated = $request->validate([
            'custom_retail_price' => ['nullable', 'numeric', 'min:0'],
            'is_active' => ['boolean'],
            'is_featured' => ['boolean'],
            'featured_order' => ['nullable', 'integer', 'min:0'],
        ]);

        // Handle empty string as null for custom_retail_price
        if (isset($validated['custom_retail_price']) && $validated['custom_retail_price'] === '') {
            $validated['custom_retail_price'] = null;
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
}
