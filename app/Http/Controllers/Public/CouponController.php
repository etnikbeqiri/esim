<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Models\Country;
use App\Models\Customer;
use App\Models\Package;
use App\Services\CouponService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    public function __construct(
        private CouponService $couponService
    ) {}

    /**
     * Validate a coupon code for public checkout (guest or authenticated).
     * Uses email to find/check customer for customer-specific rules.
     */
    public function validatePublic(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string'],
            'package_id' => ['required', 'integer', 'exists:packages,id'],
            'email' => ['required', 'email'],
            'order_amount' => ['nullable', 'numeric', 'min:0'],
            'applied_coupons' => ['nullable', 'array'],
            'applied_coupons.*' => ['string'],
        ]);

        $package = Package::findOrFail($validated['package_id']);
        $orderAmount = $validated['order_amount'] ?? (float) $package->effective_retail_price;
        $code = strtoupper(str_replace(' ', '', $validated['code']));
        $appliedCouponCodes = $validated['applied_coupons'] ?? [];

        // Find coupon first
        $coupon = Coupon::findValidCode($code);

        if (!$coupon) {
            return response()->json([
                'valid' => false,
                'error' => 'Invalid coupon code',
            ], 422);
        }

        // Check stacking rules if there are already applied coupons
        if (!empty($appliedCouponCodes)) {
            // Check if the new coupon is stackable
            if (!$coupon->is_stackable) {
                return response()->json([
                    'valid' => false,
                    'error' => 'This coupon cannot be combined with other coupons',
                ], 422);
            }

            // Check if all applied coupons are stackable
            $appliedCoupons = Coupon::whereIn('code', array_map('strtoupper', $appliedCouponCodes))->get();
            $nonStackable = $appliedCoupons->first(fn ($c) => !$c->is_stackable);

            if ($nonStackable) {
                return response()->json([
                    'valid' => false,
                    'error' => "Cannot add more coupons - {$nonStackable->code} is not stackable",
                ], 422);
            }
        }

        // Check basic validity (active, not expired, not reached global limit)
        if (!$coupon->isValid()) {
            if ($coupon->isExpired()) {
                return response()->json([
                    'valid' => false,
                    'error' => 'This coupon has expired',
                ], 422);
            }

            if ($coupon->isUpcoming()) {
                return response()->json([
                    'valid' => false,
                    'error' => 'This coupon is not yet valid',
                ], 422);
            }

            if ($coupon->hasReachedUsageLimit()) {
                return response()->json([
                    'valid' => false,
                    'error' => 'This coupon has reached its usage limit',
                ], 422);
            }

            return response()->json([
                'valid' => false,
                'error' => 'This coupon is not available',
            ], 422);
        }

        // Check minimum order amount
        if ($orderAmount < $coupon->min_order_amount) {
            return response()->json([
                'valid' => false,
                'error' => "Minimum order amount of €{$coupon->min_order_amount} required",
            ], 422);
        }

        // Find existing customer by email to check customer-specific rules
        // Email is on User model, not Customer, so we need to lookup through User
        $user = \App\Models\User::where('email', $validated['email'])->first();
        $customer = $user?->customer;

        if ($customer) {
            // Check customer-specific limits
            if ($coupon->hasCustomerReachedLimit($customer->id)) {
                return response()->json([
                    'valid' => false,
                    'error' => "You've reached the maximum usage limit for this coupon",
                ], 422);
            }

            // Check first-time only restriction
            if ($coupon->first_time_only && $customer->orders()->count() > 0) {
                return response()->json([
                    'valid' => false,
                    'error' => 'This coupon is only for first-time customers',
                ], 422);
            }

            // Check customer type restriction
            if (!empty($coupon->allowed_customer_types)) {
                if (!in_array($customer->type->value, $coupon->allowed_customer_types)) {
                    return response()->json([
                        'valid' => false,
                        'error' => 'This coupon is not available for your account type',
                    ], 422);
                }
            }
        } else {
            // New customer (guest) - first_time_only coupons are valid
            // Customer type restrictions don't apply to guests
        }

        // Check package/country/provider targeting
        // Note: empty array [] means "all allowed", same as null
        if (!empty($coupon->allowed_countries)) {
            $isCountryAllowed = false;

            // Check direct country_id match
            if (in_array($package->country_id, $coupon->allowed_countries)) {
                $isCountryAllowed = true;
            }

            // For regional packages (like EU), check if any coverage country is allowed
            if (!$isCountryAllowed && !empty($package->coverage_countries)) {
                // Get country IDs for the coverage countries (stored as names)
                $coverageCountryIds = Country::whereIn('name', $package->coverage_countries)
                    ->pluck('id')
                    ->toArray();

                // Check if any coverage country is in allowed countries
                $isCountryAllowed = !empty(array_intersect($coverageCountryIds, $coupon->allowed_countries));
            }

            if (!$isCountryAllowed) {
                return response()->json([
                    'valid' => false,
                    'error' => 'This coupon is not available for this destination',
                ], 422);
            }
        }

        if (!empty($coupon->allowed_providers)) {
            if (!in_array($package->provider_id, $coupon->allowed_providers)) {
                return response()->json([
                    'valid' => false,
                    'error' => 'This coupon is not available for this provider',
                ], 422);
            }
        }

        if (!empty($coupon->allowed_packages)) {
            if (!in_array($package->id, $coupon->allowed_packages)) {
                return response()->json([
                    'valid' => false,
                    'error' => 'This coupon is not available for this package',
                ], 422);
            }
        }

        if (!empty($coupon->exclude_packages)) {
            if (in_array($package->id, $coupon->exclude_packages)) {
                return response()->json([
                    'valid' => false,
                    'error' => 'This coupon cannot be used for this package',
                ], 422);
            }
        }

        // Calculate discount
        $discount = $this->couponService->calculateDiscount($coupon, $orderAmount);
        $finalAmount = max(0, $orderAmount - $discount);

        return response()->json([
            'valid' => true,
            'coupon' => [
                'id' => $coupon->id,
                'code' => $coupon->code,
                'name' => $coupon->name,
                'description' => $coupon->description,
                'type' => $coupon->type->value,
                'value' => $coupon->value,
                'discount_display' => $coupon->discount_display,
            ],
            'discount' => $discount,
            'original_amount' => $orderAmount,
            'final_amount' => $finalAmount,
            'is_stackable' => $coupon->is_stackable,
        ]);
    }

    /**
     * Validate a coupon code for authenticated users.
     */
    public function validate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string'],
            'package_id' => ['required', 'integer', 'exists:packages,id'],
            'order_amount' => ['nullable', 'numeric', 'min:0'],
        ]);

        // Get customer from authenticated user or guest
        $customer = auth()->user()?->customer;

        if (!$customer) {
            return response()->json([
                'valid' => false,
                'error' => 'Customer not found. Please log in.',
            ], 401);
        }

        $package = Package::findOrFail($validated['package_id']);
        $orderAmount = $validated['order_amount'] ?? (float) $package->effective_retail_price;

        $result = $this->couponService->validateCoupon(
            code: strtoupper(str_replace(' ', '', $validated['code'])),
            customer: $customer,
            package: $package,
            orderAmount: $orderAmount
        );

        if (!$result['valid']) {
            return response()->json([
                'valid' => false,
                'error' => $result['error'],
            ], 422);
        }

        /** @var Coupon $coupon */
        $coupon = $result['coupon'];

        return response()->json([
            'valid' => true,
            'coupon' => [
                'id' => $coupon->id,
                'code' => $coupon->code,
                'name' => $coupon->name,
                'description' => $coupon->description,
                'type' => $coupon->type->value,
                'value' => $coupon->value,
                'discount_display' => $coupon->discount_display,
            ],
            'discount' => $result['discount'],
            'original_amount' => $orderAmount,
            'final_amount' => $result['final_amount'],
        ]);
    }

    /**
     * Get applicable coupons for a customer and package.
     */
    public function applicable(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'package_id' => ['nullable', 'integer', 'exists:packages,id'],
            'order_amount' => ['nullable', 'numeric', 'min:0'],
        ]);

        $customer = auth()->user()?->customer;

        if (!$customer) {
            return response()->json([
                'coupons' => [],
            ]);
        }

        $package = isset($validated['package_id'])
            ? Package::findOrFail($validated['package_id'])
            : null;

        $orderAmount = $validated['order_amount'] ?? 0;

        $coupons = $this->couponService->getApplicableCoupons(
            customer: $customer,
            package: $package,
            orderAmount: $orderAmount
        );

        return response()->json([
            'coupons' => $coupons->map(fn ($coupon) => [
                'id' => $coupon->id,
                'code' => $coupon->code,
                'name' => $coupon->name,
                'description' => $coupon->description,
                'type' => $coupon->type->value,
                'value' => $coupon->value,
                'discount_display' => $coupon->discount_display,
                'min_order_amount' => $coupon->min_order_amount,
                'valid_from' => $coupon->valid_from?->toIso8601String(),
                'valid_until' => $coupon->valid_until?->toIso8601String(),
                'remaining_usages' => $coupon->remaining_usages,
                'first_time_only' => $coupon->first_time_only,
            ]),
        ]);
    }

    /**
     * Apply coupon to get pricing details.
     */
    public function apply(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
        ]);

        $customer = auth()->user()?->customer;

        if (!$customer) {
            return response()->json([
                'valid' => false,
                'error' => 'Customer not found. Please log in.',
            ], 401);
        }

        // Find coupon
        $coupon = \App\Models\Coupon::findValidCode($validated['code']);

        if (!$coupon) {
            return response()->json([
                'valid' => false,
                'error' => 'Invalid coupon code',
            ], 404);
        }

        $result = $this->couponService->applyToOrder($coupon, (float) $validated['price']);

        return response()->json($result);
    }
}
