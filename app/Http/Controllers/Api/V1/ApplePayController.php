<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Package;
use App\Services\Payment\ApplePayService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApplePayController extends Controller
{
    public function __construct(
        private readonly ApplePayService $applePayService,
    ) {}

    public function validate(Request $request): JsonResponse
    {
        $request->validate([
            'validationURL' => 'required|url',
            'package_id' => 'required|integer|exists:packages,id',
            'billing_country' => 'nullable|string|max:5',
            'coupon_codes' => 'nullable|array',
            'coupon_codes.*' => 'string|max:50',
        ]);

        $package = Package::findOrFail($request->input('package_id'));

        if (!$package->is_active) {
            return response()->json(['error' => 'Package not available'], 422);
        }

        $result = $this->applePayService->validateMerchant(
            validationUrl: $request->input('validationURL'),
            package: $package,
            billingCountry: $request->input('billing_country', 'XK'),
            couponCodes: $request->input('coupon_codes', []),
        );

        if (!$result['success']) {
            return response()->json(['error' => $result['error']], 422);
        }

        return response()->json([
            'merchantSession' => $result['merchantSession'],
            'orderId' => $result['orderId'],
        ]);
    }

    public function process(Request $request): JsonResponse
    {
        $request->validate([
            'order_id' => 'required|string|uuid',
            'token' => 'required|array',
            'shipping_contact' => 'nullable|array',
        ]);

        $shippingContact = $request->input('shipping_contact', []);
        $email = $shippingContact['emailAddress'] ?? null;
        $name = trim(($shippingContact['givenName'] ?? '') . ' ' . ($shippingContact['familyName'] ?? ''));
        $phone = $shippingContact['phoneNumber'] ?? null;

        if (!$email) {
            return response()->json(['error' => 'Email is required'], 422);
        }

        $result = $this->applePayService->processPayment(
            orderId: $request->input('order_id'),
            token: $request->input('token'),
            email: $email,
            name: $name ?: $email,
            phone: $phone,
            customerIp: $request->ip(),
        );

        if (!$result['success']) {
            return response()->json($result, 422);
        }

        return response()->json($result);
    }
}
