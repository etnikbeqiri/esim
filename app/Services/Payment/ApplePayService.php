<?php

namespace App\Services\Payment;

use App\Models\Package;
use App\Services\CheckoutService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ApplePayService
{
    public function __construct(
        private readonly ProcardGateway $gateway,
        private readonly CheckoutService $checkoutService,
    ) {}

    /**
     * Validate merchant with Apple via Procard and cache the payment context.
     */
    public function validateMerchant(
        string $validationUrl,
        Package $package,
        string $billingCountry = 'XK',
        array $couponCodes = [],
    ): array {
        $price = (float) $package->effective_retail_price;
        $orderId = (string) Str::uuid();
        $description = "eSIM Package: {$package->name}";

        $data = $this->gateway->applePayValidate(
            validationUrl: $validationUrl,
            orderId: $orderId,
            amount: $price,
            currency: 'EUR',
            description: $description,
        );

        if (($data['code'] ?? -1) !== 0 || empty($data['apple_validate_data'])) {
            Log::error('Apple Pay merchant validation failed', [
                'response' => $data,
                'order_id' => $orderId,
            ]);

            return [
                'success' => false,
                'error' => $data['message'] ?? 'Merchant validation failed',
            ];
        }

        Cache::put("apple_pay:{$orderId}", [
            'order_key' => $data['order_key'],
            'package_id' => $package->id,
            'amount' => $price,
            'billing_country' => $billingCountry,
            'coupon_codes' => $couponCodes,
        ], now()->addMinutes(30));

        Log::info('Apple Pay merchant validated', [
            'order_id' => $orderId,
            'package_id' => $package->id,
        ]);

        return [
            'success' => true,
            'merchantSession' => json_decode($data['apple_validate_data'], true),
            'orderId' => $orderId,
        ];
    }

    /**
     * Process Apple Pay payment: send token to Procard, then create the order.
     */
    public function processPayment(
        string $orderId,
        array $token,
        string $email,
        string $name,
        ?string $phone,
        ?string $customerIp,
    ): array {
        $cachedData = Cache::pull("apple_pay:{$orderId}");

        if (!$cachedData) {
            return ['success' => false, 'error' => 'Payment session expired'];
        }

        $package = Package::find($cachedData['package_id']);

        if (!$package) {
            return ['success' => false, 'error' => 'Package not found'];
        }

        $procardResult = $this->gateway->applePayProcess(
            orderKey: $cachedData['order_key'],
            token: $token,
        );

        $transactionStatus = $procardResult['transactionStatus'] ?? null;

        if ($transactionStatus !== 'Approved') {
            Log::warning('Apple Pay payment declined', [
                'order_id' => $orderId,
                'status' => $transactionStatus,
                'reason' => $procardResult['reason'] ?? null,
            ]);

            return [
                'success' => false,
                'error' => $procardResult['reason'] ?? 'Payment declined',
            ];
        }

        $result = $this->checkoutService->createApplePayCheckout(
            package: $package,
            email: $email,
            name: $name,
            phone: $phone,
            customerIp: $customerIp,
            billingCountry: $cachedData['billing_country'],
            couponCodes: $cachedData['coupon_codes'],
            gatewayOrderId: $orderId,
            transactionId: $procardResult['rrn'] ?? $orderId,
            amount: $cachedData['amount'],
        );

        if (!$result['success']) {
            return ['success' => false, 'error' => 'Order creation failed'];
        }

        Log::info('Apple Pay payment completed', [
            'order_id' => $orderId,
            'order_uuid' => $result['order_uuid'],
        ]);

        return [
            'success' => true,
            'order_uuid' => $result['order_uuid'],
            'redirect_url' => "/checkout/success/{$result['order_uuid']}",
        ];
    }
}
