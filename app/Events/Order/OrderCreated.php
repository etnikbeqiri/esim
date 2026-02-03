<?php

namespace App\Events\Order;

use App\Enums\OrderStatus;
use App\Enums\OrderType;
use App\Enums\PaymentStatus;
use App\Models\Order;
use App\States\OrderState;
use Illuminate\Support\Str;
use Thunk\Verbs\Attributes\Autodiscovery\StateId;
use Thunk\Verbs\Event;

class OrderCreated extends Event
{
    #[StateId(OrderState::class)]
    public int $order_id;

    public function __construct(
        public int $customer_id,
        public int $package_id,
        public int $provider_id,
        public OrderType $type,
        public float $amount,
        public float $cost_price,
        public ?string $customer_email = null,
        public ?string $customer_name = null,
        public ?string $ip_address = null,
        public ?string $billing_country = null,
        public ?string $user_agent = null,
        public ?int $coupon_id = null,
        public float $coupon_discount_amount = 0,
        public float $vat_rate = 0,
        public float $vat_amount = 0,
        public ?float $net_amount = null,
    ) {
        $this->order_id = snowflake_id();
    }

    public function apply(OrderState $state): void
    {
        $state->order_id = $this->order_id;
        $state->uuid = Str::uuid()->toString();
        $state->order_number = Order::generateOrderNumber();
        $state->customer_id = $this->customer_id;
        $state->package_id = $this->package_id;
        $state->provider_id = $this->provider_id;
        $state->type = $this->type;
        $state->status = OrderStatus::Pending;
        $state->payment_status = PaymentStatus::Pending;
        $state->amount = $this->amount;
        $state->cost_price = $this->cost_price;
        $state->profit = round($this->amount - $this->cost_price, 2);
        $state->coupon_id = $this->coupon_id;
        $state->coupon_discount_amount = $this->coupon_discount_amount;
        $state->vat_rate = $this->vat_rate;
        $state->vat_amount = $this->vat_amount;
        $state->net_amount = $this->net_amount;
        $state->billing_country = $this->billing_country;
    }

    public function handle(OrderState $state): Order
    {
        return Order::create([
            'id' => $state->order_id,
            'uuid' => $state->uuid,
            'order_number' => $state->order_number,
            'customer_id' => $state->customer_id,
            'package_id' => $state->package_id,
            'provider_id' => $state->provider_id,
            'type' => $state->type,
            'status' => $state->status,
            'payment_status' => $state->payment_status,
            'amount' => $state->amount,
            'cost_price' => $state->cost_price,
            'profit' => $state->profit,
            'customer_email' => $this->customer_email,
            'customer_name' => $this->customer_name,
            'ip_address' => $this->ip_address,
            'billing_country' => $this->billing_country,
            'user_agent' => $this->user_agent,
            'coupon_id' => $this->coupon_id,
            'coupon_discount_amount' => $this->coupon_discount_amount,
            'vat_rate' => $this->vat_rate,
            'vat_amount' => $this->vat_amount,
            'net_amount' => $this->net_amount,
        ]);
    }
}
