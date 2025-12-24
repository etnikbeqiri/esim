<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Country;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @tags Countries
 */
class CountryController extends Controller
{
    /**
     * List all countries
     *
     * Returns a list of all active countries with available eSIM packages.
     * Countries are sorted with popular ones first, then alphabetically.
     *
     * @queryParam region string Filter by region name. Example: Europe
     * @queryParam with_packages bool Only show countries with available packages (default: true). Example: true
     *
     * @response 200 {
     *   "data": [
     *     {
     *       "id": 1,
     *       "name": "Germany",
     *       "iso_code": "DE",
     *       "region": "Europe",
     *       "flag_emoji": "...",
     *       "is_popular": true,
     *       "packages_count": 15
     *     }
     *   ]
     * }
     */
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
            $query->whereHas('packages', function ($q) {
                $q->available();
            });
        }

        // Sort popular first, then alphabetically
        $query->orderByDesc('is_popular')
            ->orderBy('name');

        $countries = $query->get();

        return response()->json([
            'data' => $countries,
        ]);
    }

    /**
     * Get popular countries
     *
     * Returns a list of popular countries that have available eSIM packages.
     * Useful for featuring popular destinations on landing pages.
     *
     * @response 200 {
     *   "data": [
     *     {
     *       "id": 1,
     *       "name": "Germany",
     *       "iso_code": "DE",
     *       "region": "Europe",
     *       "flag_emoji": "...",
     *       "is_popular": true,
     *       "packages_count": 15
     *     }
     *   ]
     * }
     */
    public function popular(): JsonResponse
    {
        $countries = Country::active()
            ->popular()
            ->whereHas('packages', function ($q) {
                $q->available();
            })
            ->withCount(['packages' => function ($q) {
                $q->available();
            }])
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => $countries,
        ]);
    }

    /**
     * Get all regions
     *
     * Returns a list of all distinct regions that have active countries.
     * Useful for building region-based navigation or filters.
     *
     * @return array{data: string[]}
     */
    public function regions(): JsonResponse
    {
        /** @var \Illuminate\Support\Collection<int, string> $regions */
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
