<?php

namespace App\Events\Order;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Services\EmailService;
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

        // Queue emails only when not replaying
        Verbs::unlessReplaying(function () use ($state) {
            $order = Order::with(['customer.user', 'esimProfile', 'package'])->find($this->order_id);

            if (!$order) {
                return;
            }

            $emailService = app(EmailService::class);

            // Send eSIM delivery email to customer
            $emailService->sendEsimDelivery($order);

            // Send admin notification for new completed order
            $emailService->notifyAdminNewOrder($order);
        });
    }
}
