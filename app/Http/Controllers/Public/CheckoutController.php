<?php

namespace App\Http\Controllers\Public;

use App\Enums\PaymentProvider;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Package;
use App\Services\CheckoutService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    public function __construct(
        private readonly CheckoutService $checkoutService
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
            'accept_terms' => 'required|accepted',
            "payment_provider" => "nullable|string|in:{$allowedProviders}",
        ]);

        // Get selected payment provider or use default
        $paymentProvider = isset($validated['payment_provider'])
            ? PaymentProvider::tryFrom($validated['payment_provider'])
            : null;

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
        $data = [
            'uuid' => $order->uuid,
            'order_number' => $order->order_number,
            'status' => $order->status->value,
            'status_label' => $order->status->label(),
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
        ];

        if ($includeStatus) {
            $data['status_color'] = $order->status->color();
            $data['created_at'] = $order->created_at->format('M j, Y H:i');
            $data['completed_at'] = $order->completed_at?->format('M j, Y H:i');
            $data['paid_at'] = $order->paid_at?->format('M j, Y H:i');
            $data['customer_name'] = $order->customer_name;
            $data['amount'] = $order->amount;
            $data['payment_method'] = $order->payment?->provider?->label() ?? 'Card';
        }

        return $data;
    }
}
