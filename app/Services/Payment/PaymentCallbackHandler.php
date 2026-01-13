<?php

namespace App\Services\Payment;

use App\Contracts\PaymentGatewayContract;
use App\Enums\PaymentProvider;
use Illuminate\Http\Request;

class PaymentCallbackHandler
{
    public function __construct(
        private readonly PaymentGatewayFactory $gatewayFactory,
    ) {}

    /**
     * Handle payment callback from any gateway.
     * Automatically detects which gateway the callback is for.
     *
     * @return array{order_id: string, status: string, provider: PaymentProvider}|null
     */
    public function handle(Request $request): ?array
    {
        // Try each gateway to see which one can handle this callback
        foreach ($this->getActiveGateways() as $gateway) {
            if ($gateway->canHandleCallback($request)) {
                $result = $gateway->handleCallback($request);

                if ($result) {
                    return [
                        ...$result,
                        'provider' => $gateway->getProvider(),
                    ];
                }
            }
        }

        return null;
    }

    /**
     * Get list of active payment gateways.
     *
     * @return PaymentGatewayContract[]
     */
    private function getActiveGateways(): array
    {
        return [
            $this->gatewayFactory->make(PaymentProvider::Paysera),
            $this->gatewayFactory->make(PaymentProvider::Stripe),
            $this->gatewayFactory->make(PaymentProvider::Payrexx),
        ];
    }
}
