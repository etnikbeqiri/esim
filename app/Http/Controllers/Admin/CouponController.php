<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CouponRequest;
use App\Models\Country;
use App\Models\Coupon;
use App\Models\Package;
use App\Models\Provider;
use App\Services\CouponService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CouponController extends Controller
{
    public function __construct(
        private CouponService $couponService
    ) {}

    public function index(Request $request): Response
    {
        $coupons = Coupon::query()
            ->when($request->search, fn ($q, $search) => $q
                ->where('code', 'like', "%{$search}%")
                ->orWhere('name', 'like', "%{$search}%")
            )
            ->when($request->type, fn ($q, $type) => $q->where('type', $type))
            ->when($request->has('is_active'), fn ($q) => $q->where('is_active', $request->boolean('is_active')))
            ->when($request->status, fn ($q, $status) => match($status) {
                'active' => $q->valid(),
                'expired' => $q->expired(),
                'upcoming' => $q->upcoming(),
                default => $q,
            })
            ->orderByDesc('created_at')
            ->paginate(50)
            ->withQueryString();

        return Inertia::render('admin/coupons/index', [
            'coupons' => $coupons,
            'filters' => $request->only('search', 'type', 'is_active', 'status'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/coupons/create', [
            'countries' => Country::select('id', 'name', 'iso_code')->orderBy('name')->get(),
            'providers' => Provider::select('id', 'name')->orderBy('name')->get(),
            'packages' => Package::select('id', 'name')->with(['country:id,name'])->orderBy('name')->get(),
        ]);
    }

    public function store(CouponRequest $request): RedirectResponse
    {
        $coupon = Coupon::create($request->validated());

        return redirect()->route('admin.coupons.show', $coupon)
            ->with('success', "Coupon '{$coupon->code}' created successfully.");
    }

    public function show(Coupon $coupon): Response
    {
        $coupon->load(['usages.customer', 'usages.order']);

        $analytics = $this->couponService->getCouponAnalytics($coupon);

        $recentUsages = $coupon->usages()
            ->with(['customer.user', 'order'])
            ->latest()
            ->limit(20)
            ->get();

        return Inertia::render('admin/coupons/show', [
            'coupon' => $coupon,
            'analytics' => $analytics,
            'recentUsages' => $recentUsages,
        ]);
    }

    public function edit(Coupon $coupon): Response
    {
        return Inertia::render('admin/coupons/edit', [
            'coupon' => $coupon,
            'countries' => Country::select('id', 'name', 'iso_code')->orderBy('name')->get(),
            'providers' => Provider::select('id', 'name')->orderBy('name')->get(),
            'packages' => Package::select('id', 'name')->with(['country:id,name'])->orderBy('name')->get(),
        ]);
    }

    public function update(CouponRequest $request, Coupon $coupon): RedirectResponse
    {
        $coupon->update($request->validated());

        return redirect()->route('admin.coupons.show', $coupon)
            ->with('success', "Coupon '{$coupon->code}' updated successfully.");
    }

    public function destroy(Coupon $coupon): RedirectResponse
    {
        $code = $coupon->code;
        $coupon->delete();

        return back()->with('success', "Coupon '{$code}' deleted successfully.");
    }

    public function toggleActive(Coupon $coupon): RedirectResponse
    {
        $coupon->update(['is_active' => !$coupon->is_active]);

        $status = $coupon->is_active ? 'activated' : 'deactivated';
        return back()->with('success', "Coupon '{$coupon->code}' {$status} successfully.");
    }

    public function generateBulk(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'count' => ['required', 'integer', 'min:1', 'max:100'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'type' => ['required', 'in:percentage,fixed_amount'],
            'value' => ['required', 'numeric', 'min:0'],
            'min_order_amount' => ['required', 'numeric', 'min:0'],
            'usage_limit' => ['nullable', 'integer', 'min:1'],
            'per_customer_limit' => ['required', 'integer', 'min:1'],
            'valid_from' => ['nullable', 'date'],
            'valid_until' => ['nullable', 'date', 'after:valid_from'],
            'is_active' => ['boolean'],
            'is_stackable' => ['boolean'],
            'first_time_only' => ['boolean'],
            'allowed_countries' => ['nullable', 'array'],
            'allowed_countries.*' => ['integer', 'exists:countries,id'],
            'allowed_providers' => ['nullable', 'array'],
            'allowed_providers.*' => ['integer', 'exists:providers,id'],
            'allowed_packages' => ['nullable', 'array'],
            'allowed_packages.*' => ['integer', 'exists:packages,id'],
            'exclude_packages' => ['nullable', 'array'],
            'exclude_packages.*' => ['integer', 'exists:packages,id'],
            'allowed_customer_types' => ['nullable', 'array'],
            'allowed_customer_types.*' => ['in:b2b,b2c'],
        ]);

        $coupons = $this->couponService->generateBulkCodes($validated, $validated['count']);

        return back()->with('success', "Generated {$validated['count']} coupon codes successfully.");
    }

    public function bulkActivate(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:coupons,id'],
        ]);

        Coupon::whereIn('id', $validated['ids'])->update(['is_active' => true]);

        return back()->with('success', count($validated['ids']) . ' coupons activated.');
    }

    public function bulkDeactivate(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:coupons,id'],
        ]);

        Coupon::whereIn('id', $validated['ids'])->update(['is_active' => false]);

        return back()->with('success', count($validated['ids']) . ' coupons deactivated.');
    }

    public function bulkDelete(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:coupons,id'],
        ]);

        Coupon::whereIn('id', $validated['ids'])->delete();

        return back()->with('success', count($validated['ids']) . ' coupons deleted.');
    }
}
