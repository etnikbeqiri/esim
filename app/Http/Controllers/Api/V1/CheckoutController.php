<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Package;
use App\Services\CheckoutService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CheckoutController extends Controller
{
    public function __construct(
        private CheckoutService $checkoutService,
    ) {}

    /**
     * Create a checkout session for a package.
     *
     * B2B customers: Immediate balance deduction, no redirect
     * B2C customers: Payrexx checkout URL returned
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
     * Verify checkout status / poll for completion.
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
     * Get checkout status for polling.
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
