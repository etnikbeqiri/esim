<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApplePayController extends Controller
{
    public function validate(Request $request): JsonResponse
    {
        $request->validate([
            'validationURL' => 'required|url',
        ]);

        return response()->json([
            'error' => 'Merchant validation not yet implemented',
        ], 501);
    }

    public function process(Request $request): JsonResponse
    {
        $request->validate([
            'package_id' => 'required|integer|exists:packages,id',
            'token' => 'required|array',
            'billing_country' => 'nullable|string|max:5',
            'coupon_codes' => 'nullable|array',
            'shipping_contact' => 'nullable|array',
            'billing_contact' => 'nullable|array',
        ]);

        // TODO: Implement payment processing
        // 1. Extract user info from shipping_contact (email, name, phone)
        // 2. Create user/customer (like guest checkout)
        // 3. Send token to your payment gateway for processing
        // 4. Create order and payment records
        // 5. Return success with order UUID

        // $email = $request->input('shipping_contact.emailAddress');
        // $name = trim($request->input('shipping_contact.givenName') . ' ' . $request->input('shipping_contact.familyName'));
        // $phone = $request->input('shipping_contact.phoneNumber');
        // $token = $request->input('token');

        return response()->json([
            'error' => 'Payment processing not yet implemented',
        ], 501);
    }
}
