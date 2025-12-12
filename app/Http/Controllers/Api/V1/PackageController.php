<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Country;
use App\Models\Package;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PackageController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Package::with(['country', 'provider'])
            ->available();

        // Filter by country
        if ($request->has('country_id')) {
            $query->where('country_id', $request->country_id);
        }

        if ($request->has('country_code')) {
            $country = Country::where('iso_code', strtoupper($request->country_code))->first();
            if ($country) {
                $query->where('country_id', $country->id);
            }
        }

        // Filter by data amount
        if ($request->has('min_data_mb')) {
            $query->where('data_mb', '>=', $request->min_data_mb);
        }

        if ($request->has('max_data_mb')) {
            $query->where('data_mb', '<=', $request->max_data_mb);
        }

        // Filter by price
        if ($request->has('min_price')) {
            $query->where('retail_price', '>=', $request->min_price);
        }

        if ($request->has('max_price')) {
            $query->where('retail_price', '<=', $request->max_price);
        }

        // Filter by features
        if ($request->boolean('popular')) {
            $query->popular();
        }

        if ($request->boolean('featured')) {
            $query->featured();
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'retail_price');
        $sortDir = $request->get('sort_dir', 'asc');
        $query->orderBy($sortBy, $sortDir);

        // Pagination
        $perPage = min($request->get('per_page', 20), 100);
        $packages = $query->paginate($perPage);

        return response()->json([
            'data' => $packages->items(),
            'meta' => [
                'current_page' => $packages->currentPage(),
                'last_page' => $packages->lastPage(),
                'per_page' => $packages->perPage(),
                'total' => $packages->total(),
            ],
        ]);
    }

    public function show(Package $package): JsonResponse
    {
        if (!$package->isAvailable()) {
            return response()->json([
                'error' => 'Package not available',
            ], 404);
        }

        $package->load(['country', 'provider']);

        return response()->json([
            'data' => $package,
        ]);
    }

    public function popular(): JsonResponse
    {
        $packages = Package::with(['country'])
            ->available()
            ->popular()
            ->orderBy('retail_price')
            ->limit(12)
            ->get();

        return response()->json([
            'data' => $packages,
        ]);
    }

    public function byCountry(Country $country): JsonResponse
    {
        $packages = Package::with(['provider'])
            ->available()
            ->where('country_id', $country->id)
            ->orderBy('data_mb')
            ->orderBy('retail_price')
            ->get();

        return response()->json([
            'data' => $packages,
            'country' => $country,
        ]);
    }
}
