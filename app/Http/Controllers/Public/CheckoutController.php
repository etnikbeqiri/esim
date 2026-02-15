<?php

namespace App\Http\Controllers\Public;

use App\Enums\OrderStatus;
use App\Enums\PaymentProvider;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Package;
use App\Services\CheckoutService;
use App\Services\CurrencyService;
use App\Services\VatService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    public function __construct(
        private readonly CheckoutService $checkoutService,
        private readonly VatService $vatService,
    ) {}

    /**
     * Show checkout page for a package.
     */
    public function show(Request $request, Package $package): Response
    {
        abort_unless($package->is_active, 404);

        $package->load('country');

        // Get all active payment providers for B2C checkout
        $paymentProviders = PaymentProvider::activePublicProvidersArray();

        // Get authenticated user info for auto-fill
        $user = $request->user();
        $prefill = null;
        if ($user) {
            $prefill = [
                'email' => $user->email,
                'name' => $user->name,
                'phone' => $user->customer?->phone,
            ];
        }

        // Calculate VAT for the package price (default Kosovo)
        $price = (float) $package->effective_retail_price;
        $vatCalculation = $this->vatService->calculateInclusiveVat($price);

        // Billing countries with VAT rates (Kosovo has 18%, others 0%)
        $billingCountries = $this->vatService->getBillingCountries();

        return Inertia::render('public/checkout', [
            'package' => [
                'id' => $package->id,
                'name' => $package->name,
                'data_mb' => $package->data_mb,
                'data_label' => $package->data_label,
                'validity_days' => $package->validity_days,
                'validity_label' => $package->validity_label,
                'retail_price' => $package->effective_retail_price,
                'country' => $package->country ? [
                    'name' => $package->country->name,
                    'iso_code' => $package->country->iso_code,
                ] : null,
            ],
            'paymentProviders' => $paymentProviders,
            'defaultProvider' => PaymentProvider::default()->value,
            'prefill' => $prefill,
            'billingCountries' => $billingCountries,
            'vat' => [
                'enabled' => $this->vatService->isVatEnabled(),
                'rate' => $vatCalculation['rate'],
                'amount' => $vatCalculation['vat'],
                'net' => $vatCalculation['net'],
                'total' => $vatCalculation['total'],
                'country' => setting('invoices.vat_country', 'Kosovo'),
            ],
            'applePayMerchantId' => config('services.apple_pay.merchant_id'),
        ]);
    }

    /**
     * Process checkout form submission.
     */
    public function process(Request $request, Package $package): RedirectResponse|Response
    {
        abort_unless($package->is_active, 404);

        // Get allowed payment providers from enum
        $allowedProviders = collect(PaymentProvider::publicProviders())
            ->map(fn (PaymentProvider $provider) => $provider->value)
            ->implode(',');

        $validated = $request->validate([
            'email' => 'required|email|max:255',
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:50',
            'billing_country' => 'nullable|string|max:5',
            'accept_terms' => 'required|accepted',
            "payment_provider" => "nullable|string|in:{$allowedProviders}",
            'coupon_code' => 'nullable|string|max:50',
            'coupon_codes' => 'nullable|array',
            'coupon_codes.*' => 'string|max:50',
        ]);

        // Get selected payment provider or use default
        $paymentProvider = isset($validated['payment_provider'])
            ? PaymentProvider::tryFrom($validated['payment_provider'])
            : null;

        // Process coupon codes (support both single and array)
        $couponCodes = [];
        if (!empty($validated['coupon_codes'])) {
            $couponCodes = array_map(
                fn ($code) => strtoupper(str_replace(' ', '', $code)),
                $validated['coupon_codes']
            );
        } elseif (!empty($validated['coupon_code'])) {
            // Backwards compatibility for single coupon code
            $couponCodes = [strtoupper(str_replace(' ', '', $validated['coupon_code']))];
        }

        $result = $this->checkoutService->createGuestCheckout(
            package: $package,
            email: $validated['email'],
            name: $validated['name'],
            successUrl: route('public.checkout.callback'),
            cancelUrl: route('public.checkout.show', $package->id),
            failUrl: route('public.checkout.show', $package->id) . '?error=payment_failed',
            phone: $validated['phone'] ?? null,
            customerIp: $request->ip(),
            language: app()->getLocale(),
            paymentProvider: $paymentProvider,
            couponCodes: $couponCodes,
            billingCountry: $validated['billing_country'] ?? 'XK',
        );

        if (!$result->success) {
            return back()->withErrors([
                'error' => $result->errorMessage ?? 'Unable to process checkout. Please try again.',
            ]);
        }

        // Use JavaScript redirect to preserve URL fragments (required by Stripe)
        return Inertia::render('public/checkout-redirect', [
            'checkoutUrl' => $result->checkoutUrl,
        ]);
    }

    /**
     * Handle payment gateway callback.
     */
    public function callback(Request $request, \App\Services\Payment\PaymentCallbackHandler $callbackHandler): RedirectResponse
    {
        $result = $callbackHandler->handle($request);

        if (!$result) {
            Log::warning('Payment callback could not be handled', [
                'query' => $request->query()->all(),
            ]);

            return redirect()->route('home')->withErrors(['error' => 'Invalid payment callback']);
        }

        $paymentId = $result['order_id'];
        $status = $result['status'];
        $provider = $result['provider']->value;

        Log::info('Payment callback handled', compact('paymentId', 'status', 'provider'));

        $order = Order::where('uuid', $paymentId)->first();

        if (!$order) {
            return redirect()->route('home')->withErrors(['error' => 'Order not found']);
        }

        // Verify checkout with payment provider
        $this->checkoutService->verifyCheckout($order->uuid);

        // Route based on status
        return match ($status) {
            'cancelled' => $order->package_id
                ? redirect()->route('public.checkout.show', $order->package_id)->with('message', 'Payment cancelled.')
                : redirect()->route('home'),
            'failed' => redirect()->route('public.order.status', $order->uuid)->withErrors(['error' => 'Payment failed.']),
            default => redirect()->route('public.checkout.success', $order->uuid),
        };
    }

    /**
     * Show checkout success page.
     */
    public function success(Order $order): Response
    {
        $this->checkoutService->verifyCheckout($order->uuid);
        $order->load(['package.country', 'esimProfile']);

        return Inertia::render('public/checkout-success', [
            'order' => $this->formatOrderForView($order),
        ]);
    }

    /**
     * Show order status page.
     */
    public function status(Order $order): Response
    {
        $order->load(['package.country', 'esimProfile', 'payment']);

        return Inertia::render('public/order-status', [
            'order' => $this->formatOrderForView($order, includeStatus: true),
        ]);
    }

    /**
     * Check order status (API for polling).
     */
    public function checkStatus(Order $order): JsonResponse
    {
        return response()->json(
            $this->checkoutService->getCheckoutStatus($order->uuid)
        );
    }

    /**
     * Format order data for frontend view.
     */
    private function formatOrderForView(Order $order, bool $includeStatus = false): array
    {
        // Mask admin_review as "processing" for public-facing pages
        $publicStatus = $order->status === OrderStatus::AdminReview
            ? OrderStatus::Processing
            : $order->status;

        $data = [
            'uuid' => $order->uuid,
            'order_number' => $order->order_number,
            'status' => $publicStatus->value,
            'status_label' => $publicStatus->label(),
            'amount' => $order->amount,
            'original_amount' => $order->original_amount,
            'net_amount' => $order->net_amount,
            'vat_rate' => $order->vat_rate,
            'vat_amount' => $order->vat_amount,
            'coupon_discount' => $order->coupon_discount_amount,
            'coupon' => $order->coupon ? [
                'code' => $order->coupon->code,
                'name' => $order->coupon->name,
                'discount_display' => $order->coupon->discount_display,
            ] : null,
            'package' => $order->package ? [
                'name' => $order->package->name,
                'data_label' => $order->package->data_label,
                'validity_label' => $order->package->validity_label,
                'country' => $order->package->country?->name,
                'country_iso' => $order->package->country?->iso_code,
            ] : null,
            'esim' => $order->esimProfile ? [
                'iccid' => $order->esimProfile->iccid,
                'qr_code_data' => $order->esimProfile->qr_code_data,
                'lpa_string' => $order->esimProfile->lpa_string,
                'smdp_address' => $order->esimProfile->smdp_address,
                'activation_code' => $order->esimProfile->activation_code,
            ] : null,
            'customer_email' => $order->customer_email,
            'analytics' => [
                'transaction_id' => (string) $order->id,
                'value' => (float) $order->amount,
                'currency' => app(CurrencyService::class)->getDefaultCurrency()->code,
                'item' => [
                    'id' => (string) $order->package_id,
                    'name' => $order->package?->name,
                    'category' => $order->package?->country?->name,
                ],
            ],
        ];

        if ($includeStatus) {
            $data['status_color'] = $publicStatus->color();
            $data['created_at'] = $order->created_at->format('M j, Y H:i');
            $data['completed_at'] = $order->completed_at?->format('M j, Y H:i');
            $data['paid_at'] = $order->paid_at?->format('M j, Y H:i');
            $data['customer_name'] = $order->customer_name;
            $data['payment_method'] = $order->payment?->provider?->label() ?? 'Card';
        }

        return $data;
    }
}
