<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\CountryResource;
use App\Http\Resources\PackageResource;
use App\Models\Country;
use App\Models\Package;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @tags Packages
 */
class PackageController extends Controller
{
    /**
     * List all packages
     *
     * Returns a paginated list of all available eSIM packages. Supports filtering by country,
     * data amount, price range, and features like popular or featured packages.
     *
     * @queryParam country_id int Filter by country ID. Example: 1
     * @queryParam country_code string Filter by country ISO code (2-letter). Example: DE
     * @queryParam min_data_mb int Minimum data amount in MB. Example: 1024
     * @queryParam max_data_mb int Maximum data amount in MB. Example: 10240
     * @queryParam min_price float Minimum price in EUR. Example: 5.00
     * @queryParam max_price float Maximum price in EUR. Example: 50.00
     * @queryParam popular bool Filter only popular packages. Example: true
     * @queryParam featured bool Filter only featured packages. Example: true
     * @queryParam sort_by string Field to sort by (retail_price, data_mb, validity_days, name). Example: retail_price
     * @queryParam sort_dir string Sort direction (asc, desc). Example: asc
     * @queryParam per_page int Items per page (max 100). Example: 20
     *
     * @response 200 {
     *   "data": [
     *     {
     *       "id": 1,
     *       "name": "Germany 5GB",
     *       "slug": "germany-5gb",
     *       "data_mb": 5120,
     *       "validity_days": 30,
     *       "retail_price": 19.99,
     *       "country": {"id": 1, "name": "Germany", "iso_code": "DE"},
     *       "provider": {"id": 1, "name": "Provider"}
     *     }
     *   ],
     *   "meta": {
     *     "current_page": 1,
     *     "last_page": 5,
     *     "per_page": 20,
     *     "total": 100
     *   }
     * }
     */
    public function index(Request $request): JsonResponse
    {
        // Only load provider for admin users
        $relations = ['country'];
        if ($request->user()?->isAdmin()) {
            $relations[] = 'provider';
        }

        $query = Package::with($relations)
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
            'data' => PackageResource::collection($packages->items()),
            'meta' => [
                'current_page' => $packages->currentPage(),
                'last_page' => $packages->lastPage(),
                'per_page' => $packages->perPage(),
                'total' => $packages->total(),
            ],
        ]);
    }

    /**
     * Get package details
     *
     * Returns detailed information about a specific eSIM package including
     * country information, provider details, and coverage data.
     *
     * @response 200 {
     *   "data": {
     *     "id": 1,
     *     "name": "Germany 5GB",
     *     "slug": "germany-5gb",
     *     "description": "5GB data plan for Germany",
     *     "data_mb": 5120,
     *     "validity_days": 30,
     *     "retail_price": 19.99,
     *     "network_type": "4G/LTE",
     *     "sms_included": false,
     *     "voice_included": false,
     *     "hotspot_allowed": true,
     *     "country": {"id": 1, "name": "Germany", "iso_code": "DE"},
     *     "provider": {"id": 1, "name": "Provider"}
     *   }
     * }
     * @response 404 {"error": "Package not available"}
     */
    public function show(Request $request, Package $package): JsonResponse
    {
        if (!$package->isAvailable()) {
            return response()->json([
                'error' => 'Package not available',
            ], 404);
        }

        // Only load provider for admin users
        $relations = ['country'];
        if ($request->user()?->isAdmin()) {
            $relations[] = 'provider';
        }

        $package->load($relations);

        return response()->json([
            'data' => new PackageResource($package),
        ]);
    }

    /**
     * Get popular packages
     *
     * Returns up to 12 popular eSIM packages, sorted by price ascending.
     * Useful for featuring on homepage or landing pages.
     *
     * @response 200 {
     *   "data": [
     *     {
     *       "id": 1,
     *       "name": "Germany 5GB",
     *       "data_mb": 5120,
     *       "validity_days": 30,
     *       "retail_price": 19.99,
     *       "country": {"id": 1, "name": "Germany", "iso_code": "DE"}
     *     }
     *   ]
     * }
     */
    public function popular(Request $request): JsonResponse
    {
        $packages = Package::with(['country'])
            ->available()
            ->popular()
            ->orderBy('retail_price')
            ->limit(12)
            ->get();

        return response()->json([
            'data' => PackageResource::collection($packages),
        ]);
    }

    /**
     * Get packages by country
     *
     * Returns all available eSIM packages for a specific country,
     * sorted by data amount and then by price.
     *
     * @response 200 {
     *   "data": [
     *     {
     *       "id": 1,
     *       "name": "Germany 5GB",
     *       "data_mb": 5120,
     *       "validity_days": 30,
     *       "retail_price": 19.99,
     *       "provider": {"id": 1, "name": "Provider"}
     *     }
     *   ],
     *   "country": {
     *     "id": 1,
     *     "name": "Germany",
     *     "iso_code": "DE",
     *     "flag_emoji": "..."
     *   }
     * }
     */
    public function byCountry(Request $request, Country $country): JsonResponse
    {
        // Only load provider for admin users
        $relations = [];
        if ($request->user()?->isAdmin()) {
            $relations[] = 'provider';
        }

        $packages = Package::with($relations)
            ->available()
            ->where('country_id', $country->id)
            ->orderBy('data_mb')
            ->orderBy('retail_price')
            ->get();

        return response()->json([
            'data' => PackageResource::collection($packages),
            'country' => new CountryResource($country),
        ]);
    }
}
