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
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = $request->input('sort_dir', 'desc');
        $sortableColumns = ['order_number', 'type', 'status', 'amount', 'created_at', 'customer', 'package'];

        $query = Order::query()
            ->with(['customer.user:id,name,email', 'package:id,name'])
            ->when($request->search, fn ($q, $search) => $q->where('order_number', 'like', "%{$search}%")
                ->orWhereHas('customer.user', fn ($q) => $q->where('email', 'like', "%{$search}%")))
            ->when($request->status, fn ($q, $status) => $q->where('status', $status))
            ->when($request->type, fn ($q, $type) => $q->where('type', $type));

        // Handle sorting
        if (in_array($sortBy, $sortableColumns)) {
            if ($sortBy === 'customer') {
                $query->leftJoin('customers', 'orders.customer_id', '=', 'customers.id')
                    ->leftJoin('users', 'customers.user_id', '=', 'users.id')
                    ->orderBy('users.name', $sortDir)
                    ->select('orders.*');
            } elseif ($sortBy === 'package') {
                $query->leftJoin('packages', 'orders.package_id', '=', 'packages.id')
                    ->orderBy('packages.name', $sortDir)
                    ->select('orders.*');
            } else {
                $query->orderBy($sortBy, $sortDir);
            }
        } else {
            $query->orderByDesc('created_at');
        }

        $orders = $query->paginate(50)
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
                    'id' => $order->customer->id,
                    'user' => $order->customer->user ? [
                        'name' => $order->customer->user->name,
                        'email' => $order->customer->user->email,
                    ] : null,
                ] : null,
                'package' => $order->package ? [
                    'id' => $order->package->id,
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
            'filters' => $request->only('search', 'status', 'type', 'sort_by', 'sort_dir'),
            'defaultCurrency' => Currency::getDefault(),
        ]);
    }

    public function show(Order $order): Response
    {
        $order->load(['customer.user', 'package.provider', 'package.country', 'esimProfile', 'payments', 'invoice', 'coupon', 'couponUsages.coupon', 'currency']);

        $payment = $order->payments->first();

        return Inertia::render('admin/orders/show', [
            'order' => [
                'id' => $order->id,
                'uuid' => $order->uuid,
                'order_number' => $order->order_number,
                'status' => $order->status->value,
                'status_label' => $order->status->label(),
                'status_color' => $order->status->color(),
                'payment_status' => $order->payment_status?->value,
                'payment_status_label' => $order->payment_status?->label(),
                'type' => $order->type->value,
                'amount' => $order->amount,
                'original_amount' => $order->original_amount,
                'cost_price' => $order->cost_price,
                'profit' => $order->profit,
                'coupon_discount_amount' => $order->coupon_discount_amount,
                'vat_rate' => $order->vat_rate,
                'vat_amount' => $order->vat_amount,
                'net_amount' => $order->net_amount,
                'currency' => $order->currency ? [
                    'code' => $order->currency->code,
                    'symbol' => $order->currency->symbol,
                ] : null,
                'exchange_rate_used' => $order->exchange_rate_used,
                'coupon' => $order->coupon ? [
                    'id' => $order->coupon->id,
                    'code' => $order->coupon->code,
                    'name' => $order->coupon->name,
                    'type' => $order->coupon->type->value,
                    'value' => $order->coupon->value,
                    'discount_display' => $order->coupon->discount_display,
                ] : null,
                'coupon_usages' => $order->couponUsages->map(fn ($usage) => [
                    'id' => $usage->id,
                    'discount_amount' => $usage->discount_amount,
                    'coupon' => $usage->coupon ? [
                        'id' => $usage->coupon->id,
                        'code' => $usage->coupon->code,
                        'name' => $usage->coupon->name,
                        'type' => $usage->coupon->type->value,
                        'value' => $usage->coupon->value,
                        'discount_display' => $usage->coupon->discount_display,
                    ] : null,
                ])->toArray(),
                'provider_order_id' => $order->provider_order_id,
                'retry_count' => $order->retry_count,
                'max_retries' => $order->max_retries ?? 10,
                'next_retry_at' => $order->next_retry_at?->format('M j, Y H:i'),
                'next_retry_at_iso' => $order->next_retry_at?->toIso8601String(),
                'failure_reason' => $order->failure_reason,
                'failure_code' => $order->failure_code,
                'customer_email' => $order->customer_email,
                'customer_name' => $order->customer_name,
                'ip_address' => $order->ip_address,
                'user_agent' => $order->user_agent,
                'metadata' => $order->metadata,
                'created_at' => $order->created_at->format('M j, Y H:i'),
                'created_at_iso' => $order->created_at->toIso8601String(),
                'updated_at' => $order->updated_at->format('M j, Y H:i'),
                'updated_at_iso' => $order->updated_at->toIso8601String(),
                'completed_at' => $order->completed_at?->format('M j, Y H:i'),
                'completed_at_iso' => $order->completed_at?->toIso8601String(),
                'paid_at' => $order->paid_at?->format('M j, Y H:i'),
                'paid_at_iso' => $order->paid_at?->toIso8601String(),
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
                    'provider_esim_id' => $order->esimProfile->provider_esim_id ?? null,
                    'iccid' => $order->esimProfile->iccid,
                    'eid' => $order->esimProfile->eid ?? null,
                    'msisdn' => $order->esimProfile->msisdn ?? null,
                    'imsi' => $order->esimProfile->imsi ?? null,
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
                    'created_at' => $order->esimProfile->created_at?->format('M j, Y H:i'),
                    'provider_data' => $order->esimProfile->provider_data,
                ] : null,
                'payment' => $payment ? [
                    'id' => $payment->id,
                    'uuid' => $payment->uuid ?? null,
                    'status' => $payment->status->value,
                    'status_label' => $payment->status->label(),
                    'provider' => $payment->provider?->value,
                    'provider_label' => $payment->provider?->label() ?? 'Unknown',
                    'amount' => $payment->amount,
                    'gateway_session_id' => $payment->gateway_session_id,
                    'gateway_payment_id' => $payment->gateway_payment_id ?? null,
                    'created_at' => $payment->created_at?->format('M j, Y H:i'),
                    'paid_at' => $payment->paid_at?->format('M j, Y H:i'),
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
        if (!in_array($order->status, [OrderStatus::Failed, OrderStatus::PendingRetry, OrderStatus::Processing, OrderStatus::AdminReview])) {
            return back()->with('error', 'This order cannot be retried.');
        }

        $order->update([
            'status' => OrderStatus::Processing,
            'next_retry_at' => null,
        ]);

        ProcessProviderPurchase::dispatch($order->id);

        return back()->with('success', 'Order retry has been triggered.');
    }

    public function fail(Request $request, Order $order): RedirectResponse
    {
        if (!in_array($order->status, [OrderStatus::AwaitingPayment, OrderStatus::PendingRetry, OrderStatus::AdminReview])) {
            return back()->with('error', 'Only orders in "Awaiting Payment", "Pending Retry", or "Admin Review" status can be manually failed.');
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
