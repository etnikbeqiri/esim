<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Package;
use App\Services\CheckoutService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @tags Checkout
 */
class CheckoutController extends Controller
{
    public function __construct(
        private CheckoutService $checkoutService,
    ) {}

    /**
     * Create checkout session
     *
     * Creates a checkout session for purchasing an eSIM package.
     *
     * For **B2B customers**: Payment is deducted from balance immediately.
     * The response includes `instant_payment: true` and the order starts processing.
     *
     * For **B2C customers**: A payment gateway URL is returned.
     * Redirect the user to complete payment, then poll the verify endpoint.
     *
     * @authenticated
     *
     * @bodyParam package_id int required The ID of the package to purchase. Example: 1
     * @bodyParam success_url string required URL to redirect after successful payment. Example: https://example.com/success
     * @bodyParam cancel_url string required URL to redirect if payment is cancelled. Example: https://example.com/cancel
     * @bodyParam fail_url string URL to redirect if payment fails. Example: https://example.com/fail
     * @bodyParam language string Language for payment page (en, de, fr, it). Example: en
     *
     * @response 201 {
     *   "success": true,
     *   "data": {
     *     "checkout_url": "https://payment.example.com/session/...",
     *     "order_uuid": "550e8400-e29b-41d4-a716-446655440000",
     *     "provider": "balance",
     *     "amount": 19.99,
     *     "instant_payment": true,
     *     "order_number": "ORD-241224-ABC123"
     *   }
     * }
     * @response 403 {"error": "Customer account required", "message": "..."}
     * @response 422 {"success": false, "error": "Insufficient balance", "provider": "balance"}
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'package_id' => 'required|exists:packages,id',
            'success_url' => 'required|url',
            'cancel_url' => 'required|url',
            'fail_url' => 'nullable|url',
            'language' => 'nullable|string|in:en,de,fr,it',
        ]);

        $user = $request->user();
        $customer = $user->customer;

        if (!$customer) {
            return response()->json([
                'error' => 'Customer account required',
                'message' => 'Please complete your profile to make purchases.',
            ], 403);
        }

        if (!$customer->is_active) {
            return response()->json([
                'error' => 'Account inactive',
                'message' => 'Your account is not active. Please contact support.',
            ], 403);
        }

        $package = Package::with('provider', 'country')->find($request->package_id);

        $result = $this->checkoutService->createCheckout(
            customer: $customer,
            package: $package,
            successUrl: $request->success_url,
            cancelUrl: $request->cancel_url,
            failUrl: $request->fail_url,
            customerEmail: $user->email,
            customerIp: $request->ip(),
            language: $request->language ?? 'en',
        );

        if (!$result->success) {
            return response()->json([
                'success' => false,
                'error' => $result->errorMessage,
                'provider' => $result->provider->value,
            ], 422);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'checkout_url' => $result->checkoutUrl,
                'order_uuid' => $result->referenceId,
                'provider' => $result->provider->value,
                'amount' => $result->amount,
                'instant_payment' => $result->metadata['instant_payment'] ?? false,
                'order_number' => $result->metadata['order_number'] ?? null,
            ],
        ], 201);
    }

    /**
     * Verify checkout
     *
     * Verifies the checkout status and confirms if payment was successful.
     * Use this endpoint to poll for payment completion after redirecting
     * from the payment gateway.
     *
     * @authenticated
     *
     * @response 200 {
     *   "success": true,
     *   "order": {
     *     "uuid": "550e8400-e29b-41d4-a716-446655440000",
     *     "status": "processing",
     *     "payment_status": "completed"
     *   }
     * }
     * @response 404 {"success": false, "error": "Order not found"}
     */
    public function verify(Request $request, string $orderUuid): JsonResponse
    {
        $result = $this->checkoutService->verifyCheckout($orderUuid);

        if (!$result['success']) {
            return response()->json($result, 404);
        }

        // Ensure user owns this order
        $user = $request->user();
        if ($user->customer && $result['order']['uuid']) {
            $order = \App\Models\Order::where('uuid', $orderUuid)
                ->where('customer_id', $user->customer->id)
                ->first();

            if (!$order) {
                return response()->json([
                    'success' => false,
                    'error' => 'Order not found',
                ], 404);
            }
        }

        return response()->json($result);
    }

    /**
     * Get checkout status
     *
     * Returns the current status of a checkout/order for polling purposes.
     * Use this to display order progress to the user.
     *
     * @authenticated
     *
     * @response 200 {
     *   "found": true,
     *   "status": "processing",
     *   "payment_status": "completed",
     *   "esim_ready": false
     * }
     * @response 404 {"found": false}
     */
    public function status(Request $request, string $orderUuid): JsonResponse
    {
        $status = $this->checkoutService->getCheckoutStatus($orderUuid);

        if (!$status['found']) {
            return response()->json($status, 404);
        }

        return response()->json($status);
    }
}
