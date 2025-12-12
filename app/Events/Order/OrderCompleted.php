<?php

namespace App\Events\Order;

use App\Enums\EmailTemplate;
use App\Enums\OrderStatus;
use App\Jobs\Email\SendQueuedEmail;
use App\Models\EmailQueue;
use App\Models\Order;
use App\States\OrderState;
use Thunk\Verbs\Attributes\Autodiscovery\StateId;
use Thunk\Verbs\Event;
use Thunk\Verbs\Facades\Verbs;

class OrderCompleted extends Event
{
    #[StateId(OrderState::class)]
    public int $order_id;

    public function __construct(
        int $order_id,
        public ?int $esim_profile_id = null,
    ) {
        $this->order_id = $order_id;
    }

    public function validate(OrderState $state): void
    {
        $this->assert(
            $state->canTransitionTo(OrderStatus::Completed),
            "Order cannot transition to completed from status: {$state->status->value}"
        );
    }

    public function apply(OrderState $state): void
    {
        $state->status = OrderStatus::Completed;
        $state->completed_at = now();
        if ($this->esim_profile_id) {
            $state->esim_profile_id = $this->esim_profile_id;
        }
    }

    public function handle(OrderState $state): void
    {
        Order::where('id', $this->order_id)->update([
            'status' => OrderStatus::Completed,
            'completed_at' => now(),
        ]);

        // Queue delivery email for B2C orders
        Verbs::unlessReplaying(function () use ($state) {
            if ($state->isB2C()) {
                $order = Order::with('customer.user')->find($this->order_id);

                if ($order) {
                    $email = EmailQueue::create([
                        'customer_id' => $state->customer_id,
                        'order_id' => $this->order_id,
                        'template' => EmailTemplate::EsimDelivery,
                        'to_email' => $order->customer_email ?? $order->customer->user->email,
                        'to_name' => $order->customer_name ?? $order->customer->user->name,
                        'priority' => EmailTemplate::EsimDelivery->priority(),
                        'data' => [
                            'order_uuid' => $state->uuid,
                            'order_number' => $state->order_number,
                        ],
                    ]);

                    SendQueuedEmail::dispatch($email->id);
                }
            }
        });
    }
}
