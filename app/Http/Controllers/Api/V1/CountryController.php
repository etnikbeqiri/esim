<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Country;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CountryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Country::active()
            ->withCount(['packages' => function ($q) {
                $q->available();
            }]);

        // Filter by region
        if ($request->has('region')) {
            $query->byRegion($request->region);
        }

        // Only show countries with packages
        if ($request->boolean('with_packages', true)) {
            $query->having('packages_count', '>', 0);
        }

        // Sort popular first, then alphabetically
        $query->orderByDesc('is_popular')
            ->orderBy('name');

        $countries = $query->get();

        return response()->json([
            'data' => $countries,
        ]);
    }

    public function popular(): JsonResponse
    {
        $countries = Country::active()
            ->popular()
            ->withCount(['packages' => function ($q) {
                $q->available();
            }])
            ->having('packages_count', '>', 0)
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $countries,
        ]);
    }

    public function regions(): JsonResponse
    {
        $regions = Country::active()
            ->whereNotNull('region')
            ->distinct()
            ->pluck('region')
            ->sort()
            ->values();

        return response()->json([
            'data' => $regions,
        ]);
    }
}
