<?php

namespace App\Services;

use App\DTOs\Payment\CheckoutResult;
use App\Enums\CustomerType;
use App\Enums\OrderType;
use App\Enums\PaymentProvider;
use App\Enums\PaymentStatus;
use App\Events\Balance\BalanceDeducted;
use App\Events\Balance\BalanceReserved;
use App\Events\Order\OrderAwaitingPayment;
use App\Events\Order\OrderCreated;
use App\Events\Order\OrderProcessingStarted;
use App\Events\Payment\CheckoutCreated;
use App\Events\Payment\PaymentSucceeded;
use App\Models\Customer;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\Package;
use App\Models\Payment;
use App\Models\User;
use App\Services\Payment\BalanceGateway;
use App\Services\Payment\PaymentGatewayFactory;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class CheckoutService
{
    public function __construct(
        private PaymentGatewayFactory $gatewayFactory,
        private BalanceGateway $balanceGateway,
        private CouponService $couponService,
        private VatService $vatService,
    ) {}

    /**
     * Create a checkout for a package.
     * Automatically determines B2B (balance) or B2C (payment gateway) based on customer type.
     */
    public function createCheckout(
        Customer $customer,
        Package $package,
        string $successUrl,
        string $cancelUrl,
        ?string $failUrl = null,
        ?string $customerEmail = null,
        ?string $customerIp = null,
        string $language = 'en',
        ?PaymentProvider $paymentProvider = null,
        ?string $couponCode = null,
        ?string $billingCountry = null,
    ): CheckoutResult {
        // Validate package availability
        if (!$package->isAvailable()) {
            return CheckoutResult::failed(
                provider: $customer->isB2B() ? PaymentProvider::Balance : PaymentProvider::default(),
                errorMessage: 'Package not available',
                amount: 0,
            );
        }

        // Calculate price with customer discount
        $price = $customer->calculateDiscountedPrice((float) $package->effective_retail_price);

        // Apply coupon if provided
        $appliedCoupon = null;
        $couponDiscount = 0;
        $originalPrice = $price;

        if ($couponCode) {
            $validation = $this->couponService->validateCoupon($couponCode, $customer, $package, $price);
            if ($validation['valid']) {
                $appliedCoupon = $validation['coupon'];
                $couponDiscount = $validation['discount'];
                $price = max(0, $validation['final_amount']);
            }
        }

        if ($customer->isB2B()) {
            return $this->createB2BCheckout(
                customer: $customer,
                package: $package,
                price: $price,
                originalPrice: $originalPrice,
                coupon: $appliedCoupon,
                couponDiscount: $couponDiscount,
                customerEmail: $customerEmail,
                customerIp: $customerIp,
                billingCountry: $billingCountry,
            );
        }

        return $this->createB2CCheckout(
            customer: $customer,
            package: $package,
            price: $price,
            originalPrice: $originalPrice,
            coupon: $appliedCoupon,
            couponDiscount: $couponDiscount,
            successUrl: $successUrl,
            cancelUrl: $cancelUrl,
            failUrl: $failUrl,
            customerEmail: $customerEmail,
            customerIp: $customerIp,
            language: $language,
            paymentProvider: $paymentProvider,
            billingCountry: $billingCountry,
        );
    }

    /**
     * B2B checkout - immediate balance payment.
     */
    private function createB2BCheckout(
        Customer $customer,
        Package $package,
        float $price,
        float $originalPrice,
        ?Coupon $coupon,
        float $couponDiscount,
        ?string $customerEmail,
        ?string $customerIp,
        ?string $billingCountry = null,
    ): CheckoutResult {
        $balance = $customer->balance;
        if (!$balance || !$balance->canDeduct($price)) {
            return CheckoutResult::failed(
                provider: PaymentProvider::Balance,
                errorMessage: 'Insufficient balance',
                amount: $price,
                currencyId: null,
            );
        }

        try {
            DB::beginTransaction();

            $vatCalculation = $this->vatService->calculateInclusiveVat($price, $billingCountry ?? 'XK');

            $order = OrderCreated::commit(
                customer_id: $customer->id,
                package_id: $package->id,
                provider_id: $package->provider_id,
                type: OrderType::B2B,
                amount: $price,
                cost_price: (float) $package->cost_price,
                customer_email: $customerEmail ?? $customer->user?->email,
                customer_name: $customer->display_name,
                ip_address: $customerIp,
                billing_country: $billingCountry ?? 'XK',
                coupon_id: $coupon?->id,
                coupon_discount_amount: $couponDiscount,
                vat_rate: $vatCalculation['rate'],
                vat_amount: $vatCalculation['vat'],
                net_amount: $vatCalculation['net'],
            );

            // Create payment record
            $payment = CheckoutCreated::commit(
                order_id: $order->id,
                customer_id: $customer->id,
                provider: PaymentProvider::Balance,
                amount: $price,
                currency_id: null,
                gateway_id: 'balance_' . $order->uuid,
                customer_email: $customerEmail ?? $customer->user?->email,
                customer_ip: $customerIp,
            );

            // Record coupon usage if applicable
            if ($coupon && $couponDiscount > 0) {
                $this->couponService->recordUsage($coupon, $order, $originalPrice, $couponDiscount, $price);
            }

            // Reserve and deduct balance
            BalanceReserved::fire(
                customer_id: $customer->id,
                amount: $price,
                order_id: $order->id,
                description: "Order #{$order->order_number}",
            );

            BalanceDeducted::fire(
                customer_id: $customer->id,
                amount: $price,
                order_id: $order->id,
                description: "Purchase: {$package->name}",
                from_reservation: true,
            );

            // Mark payment as succeeded
            PaymentSucceeded::fire(
                payment_id: $payment->id,
                transaction_id: 'balance_' . $order->uuid,
                confirmed_amount: $price,
                gateway_status: 'completed',
            );

            // Start processing (triggers provider purchase job)
            OrderProcessingStarted::fire(order_id: $order->id);

            DB::commit();

            Log::info('B2B checkout completed', [
                'order_uuid' => $order->uuid,
                'customer_id' => $customer->id,
                'amount' => $price,
                'coupon_discount' => $couponDiscount,
            ]);

            return CheckoutResult::success(
                provider: PaymentProvider::Balance,
                checkoutUrl: '', // No redirect needed for B2B
                gatewayId: 'balance_' . $order->uuid,
                referenceId: $order->uuid,
                amount: $price,
                currencyId: null,
                metadata: [
                    'order_id' => $order->id,
                    'order_uuid' => $order->uuid,
                    'order_number' => $order->order_number,
                    'payment_id' => $payment->id,
                    'instant_payment' => true,
                    'coupon_applied' => $coupon ? true : false,
                    'coupon_discount' => $couponDiscount,
                ],
            );
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('B2B checkout failed', [
                'customer_id' => $customer->id,
                'package_id' => $package->id,
                'error' => $e->getMessage(),
            ]);

            return CheckoutResult::failed(
                provider: PaymentProvider::Balance,
                errorMessage: $e->getMessage(),
                amount: $price,
            );
        }
    }

    /**
     * B2C checkout - create payment gateway session.
     */
    private function createB2CCheckout(
        Customer $customer,
        Package $package,
        float $price,
        float $originalPrice,
        ?Coupon $coupon,
        float $couponDiscount,
        string $successUrl,
        string $cancelUrl,
        ?string $failUrl,
        ?string $customerEmail,
        ?string $customerIp,
        string $language,
        ?PaymentProvider $paymentProvider = null,
        ?string $billingCountry = null,
    ): CheckoutResult {
        try {
            DB::beginTransaction();

            $vatCalculation = $this->vatService->calculateInclusiveVat($price, $billingCountry ?? 'XK');

            $order = OrderCreated::commit(
                customer_id: $customer->id,
                package_id: $package->id,
                provider_id: $package->provider_id,
                type: OrderType::B2C,
                amount: $price,
                cost_price: (float) $package->cost_price,
                customer_email: $customerEmail ?? $customer->user?->email,
                customer_name: $customer->display_name,
                ip_address: $customerIp,
                billing_country: $billingCountry ?? 'XK',
                coupon_id: $coupon?->id,
                coupon_discount_amount: $couponDiscount,
                vat_rate: $vatCalculation['rate'],
                vat_amount: $vatCalculation['vat'],
                net_amount: $vatCalculation['net'],
            );

            // Create checkout via payment gateway (use specified or default)
            $gateway = $paymentProvider
                ? $this->gatewayFactory->make($paymentProvider)
                : $this->gatewayFactory->default();
            $checkoutResult = $gateway->createCheckout(
                order: $order,
                successUrl: $successUrl,
                cancelUrl: $cancelUrl,
                failUrl: $failUrl,
                language: $language,
            );

            if (!$checkoutResult->success) {
                throw new \Exception($checkoutResult->errorMessage ?? 'Failed to create checkout');
            }

            // Create payment record
            $payment = CheckoutCreated::commit(
                order_id: $order->id,
                customer_id: $customer->id,
                provider: $checkoutResult->provider,
                amount: $price,
                currency_id: $checkoutResult->currencyId,
                gateway_id: $checkoutResult->gatewayId,
                gateway_session_id: $checkoutResult->gatewayId,
                customer_email: $customerEmail ?? $customer->user?->email,
                customer_ip: $customerIp,
                metadata: $checkoutResult->metadata,
            );

            // Mark order as awaiting payment
            OrderAwaitingPayment::fire(
                order_id: $order->id,
                payment_id: $payment->id,
            );

            DB::commit();

            Log::info('B2C checkout created', [
                'order_uuid' => $order->uuid,
                'customer_id' => $customer->id,
                'checkout_url' => $checkoutResult->checkoutUrl,
                'coupon_discount' => $couponDiscount,
            ]);

            return CheckoutResult::success(
                provider: $checkoutResult->provider,
                checkoutUrl: $checkoutResult->checkoutUrl,
                gatewayId: $checkoutResult->gatewayId,
                referenceId: $order->uuid,
                amount: $price,
                currencyId: $checkoutResult->currencyId,
                metadata: array_merge($checkoutResult->metadata, [
                    'order_id' => $order->id,
                    'order_uuid' => $order->uuid,
                    'order_number' => $order->order_number,
                    'payment_id' => $payment->id,
                    'coupon_applied' => $coupon ? true : false,
                    'coupon_discount' => $couponDiscount,
                ]),
            );
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('B2C checkout failed', [
                'customer_id' => $customer->id,
                'package_id' => $package->id,
                'error' => $e->getMessage(),
            ]);

            return CheckoutResult::failed(
                provider: PaymentProvider::default(),
                errorMessage: $e->getMessage(),
                amount: $price,
            );
        }
    }

    /**
     * Verify a checkout payment status.
     */
    public function verifyCheckout(string $orderUuid): array
    {
        $order = Order::where('uuid', $orderUuid)
            ->with(['payments', 'customer', 'package', 'esimProfile'])
            ->first();

        if (!$order) {
            return [
                'success' => false,
                'error' => 'Order not found',
            ];
        }

        $payment = $order->payments()->latest()->first();

        if (!$payment) {
            return [
                'success' => false,
                'error' => 'Payment not found',
                'order' => $this->formatOrderResponse($order),
            ];
        }

        // For gateway payments (Stripe, Payrexx), validate with gateway
        if ($payment->provider->supportsWebhooks() && !$payment->isSuccessful()) {
            $gateway = $this->gatewayFactory->make($payment->provider);
            $validationResult = $gateway->validatePayment($payment);

            if ($validationResult->success && $validationResult->status === PaymentStatus::Completed) {
                // Trigger payment success event
                PaymentSucceeded::fire(
                    payment_id: $payment->id,
                    transaction_id: $validationResult->transactionId,
                    confirmed_amount: $validationResult->amount,
                    gateway_status: $validationResult->gatewayStatus,
                    metadata: $validationResult->metadata,
                );

                // Refresh order and payment
                $order->refresh();
                $payment->refresh();
            }
        }

        return [
            'success' => true,
            'order' => $this->formatOrderResponse($order),
            'payment' => [
                'status' => $payment->status->value,
                'provider' => $payment->provider->value,
                'amount' => $payment->amount,
            ],
            'has_esim' => $order->esimProfile !== null,
        ];
    }

    /**
     * Get checkout status for frontend polling.
     */
    public function getCheckoutStatus(string $orderUuid): array
    {
        $order = Order::where('uuid', $orderUuid)
            ->with(['payments', 'esimProfile'])
            ->first();

        if (!$order) {
            return [
                'found' => false,
                'status' => 'not_found',
            ];
        }

        $payment = $order->payments()->latest()->first();

        return [
            'found' => true,
            'order_status' => $order->status->value,
            'payment_status' => $payment?->status->value ?? 'pending',
            'has_esim' => $order->esimProfile !== null,
            'is_completed' => $order->isCompleted(),
            'is_failed' => $order->isFailed(),
        ];
    }

    /**
     * Create a guest checkout - creates user/customer if needed.
     * Uses the specified payment provider or default.
     */
    public function createGuestCheckout(
        Package $package,
        string $email,
        string $name,
        string $successUrl,
        string $cancelUrl,
        ?string $failUrl = null,
        ?string $phone = null,
        ?string $customerIp = null,
        string $language = 'en',
        ?PaymentProvider $paymentProvider = null,
        array $couponCodes = [],
        ?string $billingCountry = null,
    ): CheckoutResult {
        // Validate package availability
        if (!$package->isAvailable()) {
            return CheckoutResult::failed(
                provider: PaymentProvider::default(),
                errorMessage: 'Package not available',
                amount: 0,
            );
        }

        $price = (float) $package->effective_retail_price;
        $originalPrice = $price;

        try {
            DB::beginTransaction();

            // Find or create user and customer
            $customer = $this->findOrCreateGuestCustomer($email, $name, $phone);

            // Apply coupons if provided
            $appliedCoupons = [];
            $totalDiscount = 0;
            $primaryCoupon = null;
            $currentPrice = $price;

            foreach ($couponCodes as $couponCode) {
                $validation = $this->couponService->validateCoupon($couponCode, $customer, $package, $currentPrice);
                if ($validation['valid']) {
                    $coupon = $validation['coupon'];
                    $discount = $validation['discount'];

                    $appliedCoupons[] = [
                        'coupon' => $coupon,
                        'discount' => $discount,
                    ];

                    // First valid coupon is the primary one (stored in order)
                    if ($primaryCoupon === null) {
                        $primaryCoupon = $coupon;
                    }

                    $totalDiscount += $discount;
                    $currentPrice = max(0, $currentPrice - $discount);
                }
            }

            $price = $currentPrice;

            // Calculate VAT based on billing country (inclusive - extracted from total price)
            // Default to Kosovo (XK) if no billing country specified
            $vatCalculation = $this->vatService->calculateInclusiveVat($price, $billingCountry ?? 'XK');

            // Create order with customer
            $order = OrderCreated::commit(
                customer_id: $customer->id,
                package_id: $package->id,
                provider_id: $package->provider_id,
                type: OrderType::B2C,
                amount: $price,
                cost_price: (float) $package->cost_price,
                customer_email: $email,
                customer_name: $name,
                ip_address: $customerIp,
                billing_country: $billingCountry ?? 'XK',
                coupon_id: $primaryCoupon?->id,
                coupon_discount_amount: $totalDiscount,
                vat_rate: $vatCalculation['rate'],
                vat_amount: $vatCalculation['vat'],
                net_amount: $vatCalculation['net'],
            );

            // Create checkout via payment gateway (use specified or default)
            $gateway = $paymentProvider
                ? $this->gatewayFactory->make($paymentProvider)
                : $this->gatewayFactory->default();
            $checkoutResult = $gateway->createCheckout(
                order: $order,
                successUrl: $successUrl,
                cancelUrl: $cancelUrl,
                failUrl: $failUrl,
                language: $language,
            );

            if (!$checkoutResult->success) {
                throw new \Exception($checkoutResult->errorMessage ?? 'Failed to create checkout');
            }

            // Create payment record
            $payment = CheckoutCreated::commit(
                order_id: $order->id,
                customer_id: $customer->id,
                provider: $checkoutResult->provider,
                amount: $price,
                currency_id: $checkoutResult->currencyId,
                gateway_id: $checkoutResult->gatewayId,
                gateway_session_id: $checkoutResult->gatewayId,
                customer_email: $email,
                customer_ip: $customerIp,
                metadata: $checkoutResult->metadata,
            );

            // Record coupon usage for all applied coupons
            foreach ($appliedCoupons as $appliedCouponData) {
                $this->couponService->recordUsage(
                    $appliedCouponData['coupon'],
                    $order,
                    $originalPrice,
                    $appliedCouponData['discount'],
                    $price
                );
            }

            // Mark order as awaiting payment
            OrderAwaitingPayment::fire(
                order_id: $order->id,
                payment_id: $payment->id,
            );

            DB::commit();

            Log::info('Guest checkout created', [
                'order_uuid' => $order->uuid,
                'customer_id' => $customer->id,
                'email' => $email,
                'checkout_url' => $checkoutResult->checkoutUrl,
                'coupon_discount' => $totalDiscount,
                'coupons_applied' => count($appliedCoupons),
            ]);

            return CheckoutResult::success(
                provider: $checkoutResult->provider,
                checkoutUrl: $checkoutResult->checkoutUrl,
                gatewayId: $checkoutResult->gatewayId,
                referenceId: $order->uuid,
                amount: $price,
                currencyId: $checkoutResult->currencyId,
                metadata: array_merge($checkoutResult->metadata, [
                    'order_id' => $order->id,
                    'order_uuid' => $order->uuid,
                    'order_number' => $order->order_number,
                    'payment_id' => $payment->id,
                    'customer_id' => $customer->id,
                    'coupon_applied' => $primaryCoupon !== null,
                    'coupon_discount' => $totalDiscount,
                    'coupons_count' => count($appliedCoupons),
                ]),
            );
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Guest checkout failed', [
                'email' => $email,
                'package_id' => $package->id,
                'error' => $e->getMessage(),
            ]);

            return CheckoutResult::failed(
                provider: PaymentProvider::default(),
                errorMessage: $e->getMessage(),
                amount: $price,
            );
        }
    }

    /**
     * Find or create a user and customer for guest checkout.
     */
    private function findOrCreateGuestCustomer(string $email, string $name, ?string $phone): Customer
    {
        // Check if user already exists with this email
        $user = User::where('email', $email)->first();

        if (!$user) {
            // Create new user with random password (they can reset later)
            $user = User::create([
                'name' => $name,
                'email' => $email,
                'password' => Hash::make(Str::random(32)),
            ]);

            Log::info('Guest user created', [
                'user_id' => $user->id,
                'email' => $email,
            ]);
        }

        // Check if customer exists for this user
        $customer = $user->customer;

        if (!$customer) {
            // Create B2C customer for the user
            $customer = Customer::create([
                'user_id' => $user->id,
                'type' => CustomerType::B2C,
                'phone' => $phone,
                'is_active' => true,
                'discount_percentage' => 0,
            ]);

            Log::info('Guest customer created', [
                'customer_id' => $customer->id,
                'user_id' => $user->id,
                'email' => $email,
            ]);
        } else {
            // Update phone if provided and not set
            if ($phone && !$customer->phone) {
                $customer->update(['phone' => $phone]);
            }
        }

        return $customer;
    }

    private function formatOrderResponse(Order $order): array
    {
        return [
            'uuid' => $order->uuid,
            'order_number' => $order->order_number,
            'status' => $order->status->value,
            'status_label' => $order->status->label(),
            'type' => $order->type->value,
            'amount' => $order->amount,
            'package' => $order->package ? [
                'name' => $order->package->name,
                'data_label' => $order->package->data_label,
                'validity_label' => $order->package->validity_label,
            ] : null,
            'has_esim' => $order->esimProfile !== null,
            'created_at' => $order->created_at->toIso8601String(),
        ];
    }
}
