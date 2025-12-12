<?php

namespace App\Events\Payment;

use App\Enums\PaymentProvider;
use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use App\Models\Payment;
use App\States\PaymentState;
use Illuminate\Support\Str;
use Thunk\Verbs\Attributes\Autodiscovery\StateId;
use Thunk\Verbs\Event;

class CheckoutCreated extends Event
{
    #[StateId(PaymentState::class)]
    public int $payment_id;

    public function __construct(
        public int $order_id,
        public int $customer_id,
        public PaymentProvider $provider,
        public float $amount,
        public ?int $currency_id = null,
        public ?string $gateway_id = null,
        public ?string $gateway_session_id = null,
        public ?string $customer_email = null,
        public ?string $customer_ip = null,
        public array $metadata = [],
    ) {
        $this->payment_id = snowflake_id();
    }

    public function apply(PaymentState $state): void
    {
        $state->payment_id = $this->payment_id;
        $state->uuid = Str::uuid()->toString();
        $state->order_id = $this->order_id;
        $state->customer_id = $this->customer_id;
        $state->currency_id = $this->currency_id;
        $state->provider = $this->provider;
        $state->type = $this->provider === PaymentProvider::Balance
            ? PaymentType::Balance
            : PaymentType::Checkout;
        $state->status = PaymentStatus::Pending;
        $state->amount = $this->amount;
        $state->gateway_id = $this->gateway_id;
        $state->gateway_session_id = $this->gateway_session_id;
        $state->expires_at = now()->addMinutes(config('services.payrexx.checkout_validity_minutes', 30));
        $state->metadata = $this->metadata;
    }

    public function handle(PaymentState $state): Payment
    {
        return Payment::create([
            'id' => $state->payment_id,
            'uuid' => $state->uuid,
            'order_id' => $state->order_id,
            'customer_id' => $state->customer_id,
            'currency_id' => $state->currency_id,
            'provider' => $state->provider,
            'type' => $state->type,
            'status' => $state->status,
            'amount' => $state->amount,
            'gateway_id' => $state->gateway_id,
            'gateway_session_id' => $state->gateway_session_id,
            'customer_email' => $this->customer_email,
            'customer_ip' => $this->customer_ip,
            'expires_at' => $state->expires_at,
            'metadata' => $state->metadata,
        ]);
    }
}
