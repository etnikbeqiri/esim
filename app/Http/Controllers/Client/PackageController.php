<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Country;
use App\Models\Package;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PackageController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $customer = $user->customer;

        $query = Package::with(['country', 'provider'])
            ->available();

        // Apply filters
        if ($request->filled('country')) {
            $query->whereHas('country', fn($q) => $q->where('iso_code', $request->country));
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhereHas('country', fn($cq) => $cq->where('name', 'like', "%{$search}%"));
            });
        }

        if ($request->filled('data_min')) {
            $query->where('data_mb', '>=', $request->data_min * 1024);
        }

        if ($request->filled('data_max')) {
            $query->where('data_mb', '<=', $request->data_max * 1024);
        }

        // Sort
        $sortField = $request->sort ?? 'price';
        $sortDirection = $request->direction ?? 'asc';

        if ($sortField === 'price') {
            $query->orderByRaw('COALESCE(custom_retail_price, retail_price) ' . $sortDirection);
        } elseif ($sortField === 'data') {
            $query->orderBy('data_mb', $sortDirection);
        } elseif ($sortField === 'validity') {
            $query->orderBy('validity_days', $sortDirection);
        } else {
            $query->orderBy('name', $sortDirection);
        }

        $packages = $query->paginate(20)->through(fn($pkg) => [
            'id' => $pkg->id,
            'name' => $pkg->name,
            'slug' => $pkg->slug,
            'country' => $pkg->country?->name,
            'country_iso' => $pkg->country?->iso_code,
            'region' => $pkg->country?->region,
            'data_mb' => $pkg->data_mb,
            'data_label' => $pkg->data_label,
            'validity_days' => $pkg->validity_days,
            'validity_label' => $pkg->validity_label,
            'price' => $customer
                ? $customer->calculateDiscountedPrice((float) $pkg->effective_retail_price)
                : $pkg->effective_retail_price,
            'original_price' => $pkg->effective_retail_price,
            'has_discount' => $customer && $customer->discount_percentage > 0,
            'is_featured' => $pkg->is_featured,
            'provider' => $pkg->provider?->name,
        ]);

        // Get countries for filter
        $countries = Country::active()
            ->whereHas('packages', fn($q) => $q->available())
            ->orderBy('name')
            ->get(['id', 'name', 'iso_code', 'region']);

        return Inertia::render('client/packages/index', [
            'packages' => $packages,
            'countries' => $countries,
            'regions' => $countries->pluck('region')->unique()->filter()->values(),
            'filters' => $request->only(['country', 'search', 'data_min', 'data_max', 'sort', 'direction']),
            'customer' => $customer ? [
                'is_b2b' => $customer->isB2B(),
                'balance' => $customer->isB2B() ? $customer->available_balance : null,
                'discount_percentage' => $customer->discount_percentage,
            ] : null,
        ]);
    }

    public function show(Request $request, Package $package)
    {
        $user = $request->user();
        $customer = $user->customer;

        if (!$package->isAvailable()) {
            abort(404, 'Package not available');
        }

        $package->load(['country', 'provider']);

        $price = $customer
            ? $customer->calculateDiscountedPrice((float) $package->effective_retail_price)
            : $package->effective_retail_price;

        // Get similar packages
        $similarPackages = Package::with(['country'])
            ->available()
            ->where('id', '!=', $package->id)
            ->where('country_id', $package->country_id)
            ->take(4)
            ->get()
            ->map(fn($pkg) => [
                'id' => $pkg->id,
                'name' => $pkg->name,
                'data_label' => $pkg->data_label,
                'validity_label' => $pkg->validity_label,
                'price' => $customer
                    ? $customer->calculateDiscountedPrice((float) $pkg->effective_retail_price)
                    : $pkg->effective_retail_price,
            ]);

        return Inertia::render('client/packages/show', [
            'package' => [
                'id' => $package->id,
                'name' => $package->name,
                'description' => $package->description,
                'country' => $package->country?->name,
                'country_iso' => $package->country?->iso_code,
                'region' => $package->country?->region,
                'data_mb' => $package->data_mb,
                'data_label' => $package->data_label,
                'validity_days' => $package->validity_days,
                'validity_label' => $package->validity_label,
                'price' => $price,
                'original_price' => $package->effective_retail_price,
                'has_discount' => $customer && $customer->discount_percentage > 0,
                'network_type' => $package->network_type,
                'sms_included' => $package->sms_included,
                'voice_included' => $package->voice_included,
                'hotspot_allowed' => $package->hotspot_allowed,
                'coverage_countries' => $package->coverage_countries,
                'provider' => $package->provider?->name,
            ],
            'similarPackages' => $similarPackages,
            'customer' => $customer ? [
                'is_b2b' => $customer->isB2B(),
                'balance' => $customer->isB2B() ? $customer->available_balance : null,
                'can_afford' => $customer->isB2B()
                    ? $customer->available_balance >= $price
                    : true,
            ] : null,
        ]);
    }
}
