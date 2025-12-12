<?php

namespace App\Jobs\Order;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Events\Order\OrderCancelled;
use App\Events\Payment\PaymentFailed;
use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ExpireCheckoutSession implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 1;
    public int $timeout = 30;

    public function __construct(
        public int $orderId,
    ) {}

    /**
     * Execute the job.
     *
     * Checks if the order is still awaiting payment and cancels it if so.
     * This job is dispatched with a delay when OrderAwaitingPayment fires.
     */
    public function handle(): void
    {
        $order = Order::with('payments')->find($this->orderId);

        if (!$order) {
            Log::warning('ExpireCheckoutSession: Order not found', ['order_id' => $this->orderId]);
            return;
        }

        // Only expire if still in awaiting payment status
        if ($order->status !== OrderStatus::AwaitingPayment) {
            Log::info('ExpireCheckoutSession: Order no longer awaiting payment', [
                'order_id' => $order->id,
                'current_status' => $order->status->value,
            ]);
            return;
        }

        $payment = $order->payments()->latest()->first();

        // Don't expire if payment was successful
        if ($payment && $payment->isSuccessful()) {
            Log::info('ExpireCheckoutSession: Payment already successful', [
                'order_id' => $order->id,
                'payment_id' => $payment->id,
            ]);
            return;
        }

        // Mark payment as failed due to expiration
        if ($payment && !$payment->status->isTerminal()) {
            PaymentFailed::fire(
                payment_id: $payment->id,
                failure_code: 'checkout_expired',
                failure_message: 'Checkout session expired',
                gateway_status: 'expired',
            );
        }

        // Cancel the order
        OrderCancelled::fire(
            order_id: $order->id,
            cancellation_reason: 'Checkout session expired - payment not completed in time',
        );

        Log::info('ExpireCheckoutSession: Order cancelled due to checkout expiration', [
            'order_id' => $order->id,
            'order_uuid' => $order->uuid,
            'age_minutes' => $order->created_at->diffInMinutes(now()),
        ]);
    }
}
