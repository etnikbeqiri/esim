<?php

namespace App\Services;

use App\Enums\CouponType;
use App\Enums\CustomerType;
use App\Models\Coupon;
use App\Models\CouponUsage;
use App\Models\Country;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Package;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CouponService
{
    /**
     * Validate a coupon code for a customer and package.
     */
    public function validateCoupon(
        string $code,
        Customer $customer,
        Package $package,
        float $orderAmount = 0
    ): array {
        // Find coupon
        $coupon = Coupon::findValidCode($code);

        if (!$coupon) {
            return [
                'valid' => false,
                'error' => 'Invalid coupon code',
            ];
        }

        // Check if coupon is active and valid
        if (!$coupon->isValid()) {
            if ($coupon->isExpired()) {
                return [
                    'valid' => false,
                    'error' => 'This coupon has expired',
                ];
            }

            if ($coupon->isUpcoming()) {
                return [
                    'valid' => false,
                    'error' => 'This coupon is not yet valid',
                ];
            }

            if ($coupon->hasReachedUsageLimit()) {
                return [
                    'valid' => false,
                    'error' => 'This coupon has reached its usage limit',
                ];
            }

            return [
                'valid' => false,
                'error' => 'This coupon is not available',
            ];
        }

        // Check customer-specific limits
        if ($coupon->hasCustomerReachedLimit($customer->id)) {
            return [
                'valid' => false,
                'error' => "You've reached the maximum usage limit for this coupon ({$coupon->per_customer_limit} uses)",
            ];
        }

        // Check minimum order amount
        if ($orderAmount < $coupon->min_order_amount) {
            return [
                'valid' => false,
                'error' => "Minimum order amount of €{$coupon->min_order_amount} required",
            ];
        }

        // Check targeting rules
        $targetingResult = $this->checkTargeting($coupon, $package, $customer);
        if (!$targetingResult['valid']) {
            return $targetingResult;
        }

        // Calculate discount
        $discount = $this->calculateDiscount($coupon, $orderAmount);
        $finalAmount = max(0, $orderAmount - $discount);

        return [
            'valid' => true,
            'coupon' => $coupon,
            'discount' => $discount,
            'final_amount' => $finalAmount,
            'discount_display' => $coupon->discount_display,
        ];
    }

    /**
     * Calculate discount amount based on coupon type.
     */
    public function calculateDiscount(Coupon $coupon, float $amount): float
    {
        if ($amount <= 0) {
            return 0;
        }

        return match ($coupon->type) {
            CouponType::Percentage => round($amount * ($coupon->value / 100), 2),
            CouponType::FixedAmount => min($coupon->value, $amount), // Don't go negative
        };
    }

    /**
     * Check if usage limit is reached for a customer.
     */
    public function checkUsageLimit(Coupon $coupon, Customer $customer): bool
    {
        // Check global limit
        if ($coupon->hasReachedUsageLimit()) {
            return false;
        }

        // Check per-customer limit
        if ($coupon->hasCustomerReachedLimit($customer->id)) {
            return false;
        }

        return true;
    }

    /**
     * Check targeting rules (country, package, provider, customer type).
     */
    public function checkTargeting(
        Coupon $coupon,
        Package $package,
        Customer $customer
    ): array {
        // Check customer type restriction
        // Note: empty array [] means "all allowed", same as null
        if (!empty($coupon->allowed_customer_types)) {
            $customerType = $customer->type->value;
            if (!in_array($customerType, $coupon->allowed_customer_types)) {
                return [
                    'valid' => false,
                    'error' => 'This coupon is not available for your account type',
                ];
            }
        }

        // Check country restriction
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
                return [
                    'valid' => false,
                    'error' => 'This coupon is not available for this destination',
                ];
            }
        }

        // Check provider restriction
        if (!empty($coupon->allowed_providers)) {
            if (!in_array($package->provider_id, $coupon->allowed_providers)) {
                return [
                    'valid' => false,
                    'error' => 'This coupon is not available for this provider',
                ];
            }
        }

        // Check package inclusion list
        if (!empty($coupon->allowed_packages)) {
            if (!in_array($package->id, $coupon->allowed_packages)) {
                return [
                    'valid' => false,
                    'error' => 'This coupon is not available for this package',
                ];
            }
        }

        // Check package exclusion list
        if (!empty($coupon->exclude_packages)) {
            if (in_array($package->id, $coupon->exclude_packages)) {
                return [
                    'valid' => false,
                    'error' => 'This coupon cannot be used for this package',
                ];
            }
        }

        // Check first-time only restriction
        if ($coupon->first_time_only) {
            $previousOrders = $customer->orders()->count();
            if ($previousOrders > 0) {
                return [
                    'valid' => false,
                    'error' => 'This coupon is only for first-time customers',
                ];
            }
        }

        return ['valid' => true];
    }

    /**
     * Record coupon usage after successful order.
     */
    public function recordUsage(
        Coupon $coupon,
        Order $order,
        float $originalAmount,
        float $discountAmount,
        float $finalAmount
    ): CouponUsage {
        DB::beginTransaction();

        try {
            // Create coupon usage record
            $usage = CouponUsage::create([
                'coupon_id' => $coupon->id,
                'order_id' => $order->id,
                'customer_id' => $order->customer_id,
                'original_amount' => $originalAmount,
                'discount_amount' => $discountAmount,
                'final_amount' => $finalAmount,
            ]);

            // Increment coupon usage count
            $coupon->incrementUsage();

            DB::commit();

            Log::info('Coupon usage recorded', [
                'coupon_code' => $coupon->code,
                'order_uuid' => $order->uuid,
                'customer_id' => $order->customer_id,
                'discount_amount' => $discountAmount,
            ]);

            return $usage;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to record coupon usage', [
                'coupon_id' => $coupon->id,
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Get all applicable coupons for a customer and package.
     */
    public function getApplicableCoupons(
        Customer $customer,
        ?Package $package = null,
        float $orderAmount = 0
    ): Collection {
        $query = Coupon::valid();

        // Filter by customer type (null or empty array means all types allowed)
        $query->where(function ($q) use ($customer) {
            $q->whereNull('allowed_customer_types')
                ->orWhereRaw('JSON_LENGTH(allowed_customer_types) = 0')
                ->orWhereJsonContains('allowed_customer_types', $customer->type->value);
        });

        // Filter by first-time only
        if ($customer->orders()->count() > 0) {
            $query->where('first_time_only', false);
        }

        // Filter by country if package provided
        if ($package) {
            // Get coverage country IDs for regional packages
            $coverageCountryIds = [];
            if (!empty($package->coverage_countries)) {
                $coverageCountryIds = Country::whereIn('name', $package->coverage_countries)
                    ->pluck('id')
                    ->toArray();
            }

            $query->where(function ($q) use ($package, $coverageCountryIds) {
                // Null or empty array means all countries allowed
                $q->whereNull('allowed_countries')
                    ->orWhereRaw('JSON_LENGTH(allowed_countries) = 0')
                    ->orWhereJsonContains('allowed_countries', $package->country_id);

                // For regional packages, also check coverage countries
                foreach ($coverageCountryIds as $countryId) {
                    $q->orWhereJsonContains('allowed_countries', $countryId);
                }
            });

            // Filter by provider if package provided (null or empty = all allowed)
            $query->where(function ($q) use ($package) {
                $q->whereNull('allowed_providers')
                    ->orWhereRaw('JSON_LENGTH(allowed_providers) = 0')
                    ->orWhereJsonContains('allowed_providers', $package->provider_id);
            });

            // Filter by package inclusion list (null or empty = all allowed)
            $query->where(function ($q) use ($package) {
                $q->whereNull('allowed_packages')
                    ->orWhereRaw('JSON_LENGTH(allowed_packages) = 0')
                    ->orWhereJsonContains('allowed_packages', $package->id);
            });

            // Filter out excluded packages (null or empty = none excluded)
            $query->where(function ($q) use ($package) {
                $q->whereNull('exclude_packages')
                    ->orWhereRaw('JSON_LENGTH(exclude_packages) = 0')
                    ->orWhereJsonDoesntContain('exclude_packages', $package->id);
            });
        }

        $coupons = $query->get();

        // Filter by minimum order amount
        $coupons = $coupons->filter(function ($coupon) use ($orderAmount) {
            return $orderAmount >= $coupon->min_order_amount;
        });

        // Filter by customer usage limit
        $coupons = $coupons->filter(function ($coupon) use ($customer) {
            return !$coupon->hasCustomerReachedLimit($customer->id);
        });

        return $coupons;
    }

    /**
     * Generate bulk coupon codes.
     */
    public function generateBulkCodes(array $data, int $count = 1): array
    {
        $codes = [];
        $baseCode = $data['code'] ?? null;
        $prefix = $baseCode ? strtoupper(substr($baseCode, 0, 4)) : 'SAVE';

        for ($i = 0; $i < $count; $i++) {
            $code = $prefix . '-' . Coupon::generateCode();

            // Ensure uniqueness
            while (Coupon::where('code', $code)->exists()) {
                $code = $prefix . '-' . Coupon::generateCode();
            }

            $couponData = array_merge($data, [
                'code' => $code,
                'usage_count' => 0,
            ]);

            // Remove code from base data for subsequent iterations
            unset($data['code']);

            $coupon = Coupon::create($couponData);
            $codes[] = $coupon;
        }

        return $codes;
    }

    /**
     * Get coupon analytics.
     */
    public function getCouponAnalytics(Coupon $coupon): array
    {
        $usages = $coupon->usages();

        $totalUsages = $usages->count();
        $totalDiscount = (float) $usages->sum('discount_amount');
        $totalRevenue = (float) $usages->sum('final_amount');
        $totalOriginalValue = (float) $usages->sum('original_amount');

        // Get unique customers
        $uniqueCustomers = $usages->distinct('customer_id')->count('customer_id');

        // Average order value with coupon
        $avgOrderValue = $totalUsages > 0 ? $totalRevenue / $totalUsages : 0;

        // Average discount per usage
        $avgDiscount = $totalUsages > 0 ? $totalDiscount / $totalUsages : 0;

        // Conversion rate (usages / views if tracked)
        // This would require tracking coupon views/checks

        // Recent usage trend (last 7 days)
        $recentUsages = $usages->where('created_at', '>=', now()->subDays(7))->count();

        // Top customers by usage
        $topCustomers = $coupon->usages()
            ->selectRaw('customer_id, COUNT(*) as usage_count, SUM(discount_amount) as total_discount')
            ->groupBy('customer_id')
            ->orderByDesc('usage_count')
            ->limit(5)
            ->with('customer')
            ->get();

        return [
            'total_usages' => $totalUsages,
            'unique_customers' => $uniqueCustomers,
            'total_discount_given' => $totalDiscount,
            'total_revenue_generated' => $totalRevenue,
            'total_original_value' => $totalOriginalValue,
            'average_order_value' => round($avgOrderValue, 2),
            'average_discount' => round($avgDiscount, 2),
            'remaining_usages' => $coupon->remaining_usages,
            'usage_percentage' => $coupon->usage_percentage,
            'recent_usages_7days' => $recentUsages,
            'top_customers' => $topCustomers,
            'is_active' => $coupon->is_active,
            'is_expired' => $coupon->isExpired(),
            'is_upcoming' => $coupon->isUpcoming(),
        ];
    }

    /**
     * Void a coupon usage (e.g., for refunded orders).
     */
    public function voidUsage(Order $order): void
    {
        if (!$order->coupon_id || !$order->couponUsage) {
            return;
        }

        DB::beginTransaction();

        try {
            // Delete the usage record
            $order->couponUsage()->delete();

            // Decrement coupon usage count
            $order->coupon->decrementUsage();

            // Clear coupon reference on order
            $order->update([
                'coupon_id' => null,
                'coupon_discount_amount' => 0,
            ]);

            DB::commit();

            Log::info('Coupon usage voided', [
                'order_uuid' => $order->uuid,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to void coupon usage', [
                'order_uuid' => $order->uuid,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Get system-wide coupon statistics.
     */
    public function getSystemStats(): array
    {
        $totalCoupons = Coupon::count();
        $activeCoupons = Coupon::where('is_active', true)->count();
        $expiredCoupons = Coupon::expired()->count();

        $totalUsages = CouponUsage::count();
        $totalDiscountGiven = (float) CouponUsage::sum('discount_amount');
        $totalRevenueWithCoupons = (float) CouponUsage::sum('final_amount');

        // Most used coupons
        $mostUsedCoupons = Coupon::withCount('usages')
            ->orderByDesc('usages_count')
            ->limit(5)
            ->get();

        // Top performing by revenue
        $topByRevenue = Coupon::whereHas('usages')
            ->withSum('usages as total_revenue', 'final_amount')
            ->orderByDesc('total_revenue')
            ->limit(5)
            ->get();

        return [
            'total_coupons' => $totalCoupons,
            'active_coupons' => $activeCoupons,
            'expired_coupons' => $expiredCoupons,
            'total_usages' => $totalUsages,
            'total_discount_given' => $totalDiscountGiven,
            'total_revenue_with_coupons' => $totalRevenueWithCoupons,
            'most_used_coupons' => $mostUsedCoupons,
            'top_by_revenue' => $topByRevenue,
        ];
    }

    /**
     * Apply coupon to order price.
     */
    public function applyToOrder(Coupon $coupon, float $price): array
    {
        $discount = $this->calculateDiscount($coupon, $price);
        $finalPrice = max(0, $price - $discount);

        return [
            'original_price' => $price,
            'discount' => $discount,
            'final_price' => $finalPrice,
            'coupon' => [
                'code' => $coupon->code,
                'name' => $coupon->name,
                'type' => $coupon->type->value,
                'value' => $coupon->value,
                'discount_display' => $coupon->discount_display,
            ],
        ];
    }
}
