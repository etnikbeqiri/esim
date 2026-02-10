<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Services\Payment\PayseraGateway;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentMethodsController extends Controller
{
    public function __construct(
        private readonly PayseraGateway $payseraGateway,
    ) {}

    /**
     * Get available payment methods for a billing country.
     */
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'country' => 'required|string|max:5',
            'amount' => 'nullable|integer|min:1',
            'currency' => 'nullable|string|max:3',
        ]);

        $country = $validated['country'];
        $amountCents = $validated['amount'] ?? 1000;
        $currency = $validated['currency'] ?? 'EUR';

        $methods = $this->payseraGateway->fetchAvailablePaymentMethods(
            countryCode: $country,
            currency: $currency,
            amountCents: $amountCents,
        );

        return response()->json([
            'methods' => $methods,
            'country' => $country,
        ]);
    }
}
