<?php

namespace App\Http\Controllers\Client;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $customer = $user->customer;

        if (!$customer) {
            return Inertia::render('client/orders/index', [
                'orders' => ['data' => [], 'current_page' => 1, 'last_page' => 1, 'total' => 0],
                'customer' => null,
            ]);
        }

        $query = Order::where('customer_id', $customer->id)
            ->with(['package', 'esimProfile', 'payments']);

        // Apply filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $orders = $query->latest()->paginate(15)->through(function ($order) {
            // Mask admin_review as "processing" for customers — they don't need to know about internal errors
            $customerStatus = $order->status === OrderStatus::AdminReview
                ? OrderStatus::Processing
                : $order->status;

            return [
                'uuid' => $order->uuid,
                'order_number' => $order->order_number,
                'status' => $customerStatus->value,
                'status_label' => $customerStatus->label(),
                'status_color' => $customerStatus->color(),
                'type' => $order->type->value,
                'amount' => $order->amount,
                'package' => $order->package ? [
                    'name' => $order->package->name,
                    'data_label' => $order->package->data_label,
                    'validity_label' => $order->package->validity_label,
                    'country' => $order->package->country?->name,
                    'country_iso' => $order->package->country?->iso_code,
                ] : null,
                'has_esim' => $order->esimProfile !== null,
                'payment_status' => $order->payment_status?->value,
                'retry_count' => $order->retry_count,
                'max_retries' => $order->max_retries ?? 10,
                'next_retry_at' => $order->next_retry_at?->format('M j, Y H:i'),
                'failure_reason' => null,
                'created_at' => $order->created_at->format('M j, Y H:i'),
                'completed_at' => $order->completed_at?->format('M j, Y H:i'),
            ];
        });

        return Inertia::render('client/orders/index', [
            'orders' => $orders,
            'filters' => $request->only(['status']),
            'customer' => [
                'is_b2b' => $customer->isB2B(),
                'balance' => $customer->isB2B() ? $customer->available_balance : null,
            ],
        ]);
    }

    public function show(Request $request, string $uuid)
    {
        $user = $request->user();
        $customer = $user->customer;

        if (!$customer) {
            abort(403, 'Customer account required');
        }

        $order = Order::where('uuid', $uuid)
            ->where('customer_id', $customer->id)
            ->with(['package.country', 'esimProfile', 'payments', 'provider'])
            ->firstOrFail();

        // Mask admin_review as "processing" for customers
        $customerStatus = $order->status === OrderStatus::AdminReview
            ? OrderStatus::Processing
            : $order->status;

        return Inertia::render('client/orders/show', [
            'order' => [
                'uuid' => $order->uuid,
                'order_number' => $order->order_number,
                'status' => $customerStatus->value,
                'status_label' => $customerStatus->label(),
                'status_color' => $customerStatus->color(),
                'type' => $order->type->value,
                'type_label' => $order->type->label(),
                'amount' => $order->amount,
                'cost_price' => $order->cost_price,
                'profit' => $order->profit,
                'payment_status' => $order->payment_status?->value,
                'payment_status_label' => $order->payment_status?->label(),
                'retry_count' => $order->retry_count,
                'max_retries' => $order->max_retries ?? 10,
                'next_retry_at' => $order->next_retry_at?->format('M j, Y H:i'),
                'failure_reason' => null,
                'package' => $order->package ? [
                    'name' => $order->package->name,
                    'data_label' => $order->package->data_label,
                    'validity_label' => $order->package->validity_label,
                    'country' => $order->package->country?->name,
                    'country_iso' => $order->package->country?->iso_code,
                ] : null,
                'esim' => $order->esimProfile ? [
                    'iccid' => $order->esimProfile->iccid,
                    'smdp_address' => $order->esimProfile->smdp_address,
                    'activation_code' => $order->esimProfile->activation_code,
                    'qr_code_data' => $order->esimProfile->qr_code_data,
                    'lpa_string' => $order->esimProfile->lpa_string,
                    'status' => $order->esimProfile->status?->value,
                ] : null,
                'payments' => $order->payments->map(fn($payment) => [
                    'uuid' => $payment->uuid,
                    'status' => $payment->status->value,
                    'status_label' => $payment->status->label(),
                    'provider' => $payment->provider->value,
                    'amount' => $payment->amount,
                    'created_at' => $payment->created_at->format('M j, Y H:i'),
                ]),
                'created_at' => $order->created_at->format('M j, Y H:i'),
                'completed_at' => $order->completed_at?->format('M j, Y H:i'),
                'paid_at' => $order->paid_at?->format('M j, Y H:i'),
            ],
            'customer' => [
                'is_b2b' => $customer->isB2B(),
            ],
        ]);
    }
}
