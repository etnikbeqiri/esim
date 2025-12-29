<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Events\Order\OrderFailed;
use App\Events\Payment\PaymentFailed;
use App\Http\Controllers\Controller;
use App\Jobs\Order\ProcessProviderPurchase;
use App\Jobs\Sync\SyncEsimUsageJob;
use App\Models\Currency;
use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $orders = Order::query()
            ->with(['customer.user:id,name,email', 'package:id,name'])
            ->when($request->search, fn ($q, $search) => $q->where('order_number', 'like', "%{$search}%")
                ->orWhereHas('customer.user', fn ($q) => $q->where('email', 'like', "%{$search}%")))
            ->when($request->status, fn ($q, $status) => $q->where('status', $status))
            ->when($request->type, fn ($q, $type) => $q->where('type', $type))
            ->orderByDesc('created_at')
            ->paginate(50)
            ->through(fn ($order) => [
                'id' => $order->id,
                'uuid' => $order->uuid,
                'order_number' => $order->order_number,
                'status' => $order->status->value,
                'status_label' => $order->status->label(),
                'status_color' => $order->status->color(),
                'type' => $order->type->value,
                'amount' => $order->amount,
                'retry_count' => $order->retry_count,
                'max_retries' => $order->max_retries ?? 10,
                'next_retry_at' => $order->next_retry_at?->format('M j, H:i'),
                'failure_reason' => $order->failure_reason,
                'created_at' => $order->created_at->format('M j, Y H:i'),
                'customer' => $order->customer ? [
                    'user' => $order->customer->user ? [
                        'name' => $order->customer->user->name,
                        'email' => $order->customer->user->email,
                    ] : null,
                ] : null,
                'package' => $order->package ? [
                    'name' => $order->package->name,
                ] : null,
            ])
            ->withQueryString();

        return Inertia::render('admin/orders/index', [
            'orders' => $orders,
            'statuses' => collect(OrderStatus::cases())->map(fn ($s) => [
                'value' => $s->value,
                'label' => $s->label(),
                'color' => $s->color(),
            ]),
            'filters' => $request->only('search', 'status', 'type'),
            'defaultCurrency' => Currency::getDefault(),
        ]);
    }

    public function show(Order $order): Response
    {
        $order->load(['customer.user', 'package.provider', 'package.country', 'esimProfile', 'payments', 'invoice']);

        $payment = $order->payments->first();

        return Inertia::render('admin/orders/show', [
            'order' => [
                'id' => $order->id,
                'uuid' => $order->uuid,
                'order_number' => $order->order_number,
                'status' => $order->status->value,
                'status_label' => $order->status->label(),
                'status_color' => $order->status->color(),
                'type' => $order->type->value,
                'amount' => $order->amount,
                'cost_price' => $order->cost_price,
                'profit' => $order->profit,
                'provider_order_id' => $order->provider_order_id,
                'retry_count' => $order->retry_count,
                'max_retries' => $order->max_retries ?? 10,
                'next_retry_at' => $order->next_retry_at?->format('M j, Y H:i'),
                'failure_reason' => $order->failure_reason,
                'customer_email' => $order->customer_email,
                'customer_name' => $order->customer_name,
                'ip_address' => $order->ip_address,
                'user_agent' => $order->user_agent,
                'created_at' => $order->created_at->format('M j, Y H:i'),
                'updated_at' => $order->updated_at->format('M j, Y H:i'),
                'completed_at' => $order->completed_at?->format('M j, Y H:i'),
                'customer' => $order->customer ? [
                    'id' => $order->customer->id,
                    'type' => $order->customer->type->value,
                    'user' => $order->customer->user ? [
                        'name' => $order->customer->user->name,
                        'email' => $order->customer->user->email,
                    ] : null,
                ] : null,
                'package' => $order->package ? [
                    'id' => $order->package->id,
                    'name' => $order->package->name,
                    'data_mb' => $order->package->data_mb,
                    'validity_days' => $order->package->validity_days,
                    'provider' => $order->package->provider ? [
                        'name' => $order->package->provider->name,
                    ] : null,
                    'country' => $order->package->country ? [
                        'name' => $order->package->country->name,
                    ] : null,
                ] : null,
                'esim_profile' => $order->esimProfile ? [
                    'id' => $order->esimProfile->id,
                    'iccid' => $order->esimProfile->iccid,
                    'activation_code' => $order->esimProfile->activation_code,
                    'smdp_address' => $order->esimProfile->smdp_address,
                    'lpa_string' => $order->esimProfile->lpa_string,
                    'pin' => $order->esimProfile->pin,
                    'puk' => $order->esimProfile->puk,
                    'apn' => $order->esimProfile->apn,
                    'status' => $order->esimProfile->status?->value,
                    'status_label' => $order->esimProfile->status?->label(),
                    'status_color' => $order->esimProfile->status?->color(),
                    'is_activated' => $order->esimProfile->is_activated,
                    'topup_available' => $order->esimProfile->topup_available,
                    'data_used_bytes' => $order->esimProfile->data_used_bytes ?? 0,
                    'data_total_bytes' => $order->esimProfile->data_total_bytes ?? 0,
                    'data_used_mb' => $order->esimProfile->data_used_mb,
                    'data_total_mb' => $order->esimProfile->data_total_mb,
                    'data_remaining_bytes' => $order->esimProfile->data_remaining_bytes,
                    'data_usage_percentage' => $order->esimProfile->data_usage_percentage,
                    'activated_at' => $order->esimProfile->activated_at?->format('M j, Y H:i'),
                    'expires_at' => $order->esimProfile->expires_at?->format('M j, Y H:i'),
                    'last_usage_check_at' => $order->esimProfile->last_usage_check_at?->format('M j, Y H:i'),
                    'provider_data' => $order->esimProfile->provider_data,
                ] : null,
                'payment' => $payment ? [
                    'id' => $payment->id,
                    'status' => $payment->status->value,
                    'provider' => $payment->provider?->label() ?? 'Unknown',
                    'amount' => $payment->amount,
                    'gateway_session_id' => $payment->gateway_session_id,
                ] : null,
                'invoice' => $order->invoice ? [
                    'id' => $order->invoice->id,
                    'uuid' => $order->invoice->uuid,
                    'invoice_number' => $order->invoice->invoice_number,
                    'status' => $order->invoice->status->value,
                    'status_label' => $order->invoice->status->label(),
                ] : null,
            ],
            'defaultCurrency' => Currency::getDefault(),
        ]);
    }

    public function retry(Order $order): RedirectResponse
    {
        // Only allow retry for orders in retryable states
        if (!in_array($order->status, [OrderStatus::Failed, OrderStatus::PendingRetry, OrderStatus::Processing])) {
            return back()->with('error', 'This order cannot be retried.');
        }

        // Reset to processing state
        $order->update([
            'status' => OrderStatus::Processing,
            'next_retry_at' => null,
        ]);

        // Dispatch the job immediately (no delay)
        ProcessProviderPurchase::dispatch($order->id);

        return back()->with('success', 'Order retry has been triggered.');
    }

    public function fail(Request $request, Order $order): RedirectResponse
    {
        // Only allow failing orders in awaiting_payment or pending_retry states
        if (!in_array($order->status, [OrderStatus::AwaitingPayment, OrderStatus::PendingRetry])) {
            return back()->with('error', 'Only orders in "Awaiting Payment" or "Pending Retry" status can be manually failed.');
        }

        $reason = $request->input('reason', 'Manually failed by admin');

        // For awaiting_payment orders, also fail any pending payment
        if ($order->status === OrderStatus::AwaitingPayment) {
            $payment = $order->payments()->latest()->first();
            if ($payment && !$payment->status->isTerminal()) {
                PaymentFailed::fire(
                    payment_id: $payment->id,
                    failure_code: 'admin_cancelled',
                    failure_message: $reason,
                    gateway_status: 'cancelled',
                );
                // PaymentFailed will trigger OrderFailed automatically
                return back()->with('success', 'Order and payment have been marked as failed.');
            }
        }

        // Fire the OrderFailed event directly (for pending_retry or if no active payment)
        OrderFailed::fire(
            order_id: $order->id,
            failure_reason: $reason,
            failure_code: 'admin_cancelled',
        );

        return back()->with('success', 'Order has been marked as failed.');
    }

    public function syncEsim(Order $order): RedirectResponse
    {
        if (!$order->esimProfile) {
            return back()->with('error', 'This order has no eSIM profile to sync.');
        }

        // Dispatch the sync job for this specific eSIM profile
        SyncEsimUsageJob::dispatch($order->esimProfile->id);

        return back()->with('success', 'eSIM usage sync has been triggered. Refresh the page in a few seconds to see updated data.');
    }
}
