<?php

namespace App\Http\Controllers\Client;

use App\Enums\OrderStatus;
use App\Enums\PaymentProvider;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Package;
use App\Services\CheckoutService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class CheckoutController extends Controller
{
    public function __construct(
        private CheckoutService $checkoutService,
    ) {}

    public function show(Request $request, Package $package)
    {
        $user = $request->user();
        $customer = $user->customer;

        if (!$customer) {
            return redirect()->route('client.packages.index')
                ->with('error', 'Please complete your profile to make purchases.');
        }

        if (!$package->isAvailable()) {
            return redirect()->route('client.packages.index')
                ->with('error', 'This package is no longer available.');
        }

        $package->load(['country', 'provider']);

        $price = $customer->calculateDiscountedPrice((float) $package->effective_retail_price);

        // Get active payment providers for B2C users
        $paymentProviders = $customer->isB2B() ? [] : PaymentProvider::activePublicProvidersArray();
        $defaultProvider = PaymentProvider::default()->value;

        return Inertia::render('client/checkout/show', [
            'package' => [
                'id' => $package->id,
                'name' => $package->name,
                'country' => $package->country?->name,
                'country_iso' => $package->country?->iso_code,
                'data_label' => $package->data_label,
                'validity_label' => $package->validity_label,
                'price' => $price,
                'original_price' => $package->effective_retail_price,
                'has_discount' => $customer->discount_percentage > 0,
                'discount_percentage' => $customer->discount_percentage,
            ],
            'customer' => [
                'is_b2b' => $customer->isB2B(),
                'balance' => $customer->isB2B() ? $customer->available_balance : null,
                'can_afford' => $customer->isB2B()
                    ? $customer->available_balance >= $price
                    : true,
                'display_name' => $customer->display_name,
                'email' => $user->email,
            ],
            'paymentProviders' => $paymentProviders,
            'defaultProvider' => $defaultProvider,
        ]);
    }

    public function process(Request $request, Package $package)
    {
        $user = $request->user();
        $customer = $user->customer;

        if (!$customer) {
            return back()->with('error', 'Customer account required');
        }

        if (!$package->isAvailable()) {
            return back()->with('error', 'Package not available');
        }

        // Validate payment provider for B2C
        $paymentProvider = null;
        if (!$customer->isB2B()) {
            $allowedProviders = collect(PaymentProvider::publicProviders())
                ->map(fn (PaymentProvider $provider) => $provider->value)
                ->implode(',');

            $validated = $request->validate([
                'payment_provider' => "nullable|string|in:{$allowedProviders}",
            ]);
            $paymentProvider = isset($validated['payment_provider'])
                ? PaymentProvider::tryFrom($validated['payment_provider'])
                : null;
        }

        $validated = $request->validate([
            'coupon_code' => 'nullable|string|max:50',
            'billing_country' => 'nullable|string|max:5',
        ]);

        $couponCode = $validated['coupon_code'] ?? null;
        if ($couponCode) {
            $couponCode = strtoupper(str_replace(' ', '', $couponCode));
        }

        $billingCountry = $validated['billing_country'] ?? $customer->country ?? 'XK';

        $successUrl = route('checkout.callback');
        $cancelUrl = route('checkout.cancel');
        $failUrl = route('checkout.cancel') . '?status=failed';

        $result = $this->checkoutService->createCheckout(
            customer: $customer,
            package: $package,
            successUrl: $successUrl,
            cancelUrl: $cancelUrl,
            failUrl: $failUrl,
            customerEmail: $user->email,
            customerIp: $request->ip(),
            paymentProvider: $paymentProvider,
            couponCode: $couponCode,
            billingCountry: $billingCountry,
        );

        if (!$result->success) {
            $error = $result->errorMessage ?? 'Checkout failed';
            // Check if it's a coupon-related error
            if ($couponCode && str_contains(strtolower($error), 'coupon')) {
                return back()->with('error', "Coupon error: {$error}")->withInput();
            }
            return back()->with('error', $error);
        }

        // For B2B (balance), redirect to success page directly
        if ($result->metadata['instant_payment'] ?? false) {
            return redirect()->route('client.checkout.success', ['order' => $result->referenceId])
                ->with('success', 'Order placed successfully!');
        }

        // For B2C (Stripe/Payrexx), redirect to external checkout
        // Use JavaScript redirect to preserve URL fragments (required by Stripe)
        return Inertia::render('client/checkout/redirect', [
            'checkoutUrl' => $result->checkoutUrl,
        ]);
    }

    public function success(Request $request, string $order)
    {
        $user = $request->user();
        $customer = $user->customer;

        // Handle Payrexx callback params
        $paymentStatus = $request->query('status', 'success');

        $orderModel = Order::where('uuid', $order)
            ->with(['package.country', 'esimProfile', 'payments'])
            ->first();

        if (!$orderModel) {
            return redirect()->route('client.orders.index')
                ->with('error', 'Order not found');
        }

        // Verify ownership
        if ($customer && $orderModel->customer_id !== $customer->id) {
            return redirect()->route('client.orders.index')
                ->with('error', 'Order not found');
        }

        // Verify payment if redirected from Payrexx
        if ($paymentStatus === 'success' && !$orderModel->isCompleted()) {
            $this->checkoutService->verifyCheckout($order);
            $orderModel->refresh();
        }

        $customerStatus = $orderModel->status === OrderStatus::AdminReview
            ? OrderStatus::Processing
            : $orderModel->status;

        return Inertia::render('client/checkout/success', [
            'order' => [
                'uuid' => $orderModel->uuid,
                'order_number' => $orderModel->order_number,
                'status' => $customerStatus->value,
                'status_label' => $customerStatus->label(),
                'amount' => $orderModel->amount,
                'coupon_discount' => $orderModel->coupon_discount_amount,
                'coupon' => $orderModel->coupon ? [
                    'code' => $orderModel->coupon->code,
                    'name' => $orderModel->coupon->name,
                    'discount_display' => $orderModel->coupon->discount_display,
                ] : null,
                'package' => $orderModel->package ? [
                    'name' => $orderModel->package->name,
                    'country' => $orderModel->package->country?->name,
                    'data_label' => $orderModel->package->data_label,
                    'validity_label' => $orderModel->package->validity_label,
                ] : null,
                'has_esim' => $orderModel->esimProfile !== null,
                'esim' => $orderModel->esimProfile ? [
                    'iccid' => $orderModel->esimProfile->iccid,
                    'qr_code_data' => $orderModel->esimProfile->qr_code_data,
                    'lpa_string' => $orderModel->esimProfile->lpa_string,
                    'smdp_address' => $orderModel->esimProfile->smdp_address,
                    'activation_code' => $orderModel->esimProfile->activation_code,
                ] : null,
            ],
            'payment_status' => $paymentStatus,
        ]);
    }

    /**
     * Handle payment gateway callback.
     */
    public function callback(Request $request, \App\Services\Payment\PaymentCallbackHandler $callbackHandler): RedirectResponse
    {
        $result = $callbackHandler->handle($request);

        if (!$result) {
            Log::warning('Client payment callback could not be handled', [
                'query' => $request->query()->all(),
            ]);

            return redirect()->route('orders.index')
                ->withErrors(['error' => 'Invalid payment callback']);
        }

        $paymentId = $result['order_id'];
        $status = $result['status'];

        Log::info('Client payment callback handled', compact('paymentId', 'status'));

        $order = Order::where('uuid', $paymentId)->first();

        if (!$order) {
            return redirect()->route('orders.index')
                ->withErrors(['error' => 'Order not found']);
        }

        // Verify ownership
        $user = $request->user();
        $customer = $user?->customer;
        if ($customer && $order->customer_id !== $customer->id) {
            return redirect()->route('orders.index')
                ->withErrors(['error' => 'Order not found']);
        }

        // Verify checkout with payment provider
        $this->checkoutService->verifyCheckout($order->uuid);

        // Route based on status
        return match ($status) {
            'cancelled' => $order->package_id
                ? redirect()->route('checkout.show', $order->package_id)
                    ->with('message', 'Payment cancelled.')
                : redirect()->route('packages.index'),
            'failed' => redirect()->route('orders.show', $order->uuid)
                ->withErrors(['error' => 'Payment failed.']),
            default => redirect()->route('checkout.success', $order->uuid),
        };
    }

    public function cancel(Request $request)
    {
        return Inertia::render('client/checkout/cancel');
    }

    public function status(Request $request, string $order)
    {
        $status = $this->checkoutService->getCheckoutStatus($order);

        return response()->json($status);
    }
}
