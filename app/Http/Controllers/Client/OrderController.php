<?php

namespace App\Http\Controllers\Client;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\EmailService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
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

    public function resendEsim(Request $request, string $uuid)
    {
        $user = $request->user();
        $customer = $user->customer;

        if (!$customer) {
            abort(403, 'Customer account required');
        }

        $order = Order::where('uuid', $uuid)
            ->where('customer_id', $customer->id)
            ->with(['esimProfile', 'payments'])
            ->firstOrFail();

        // Validate the order has an eSIM profile
        if (!$order->esimProfile) {
            return back()->with('error', 'This order does not have an eSIM profile yet.');
        }

        // Validate custom email format if provided
        $customEmail = $request->input('email');
        if ($customEmail && !filter_var($customEmail, FILTER_VALIDATE_EMAIL)) {
            return back()->with('error', 'Please provide a valid email address.');
        }

        try {
            $emailService = app(EmailService::class);

            // Use the resendEsimDelivery method which properly handles the email logic
            // If a custom email is provided, it will use that; otherwise, it uses the order's email
            $emailQueue = $emailService->resendEsimDelivery($order, $customEmail);

            if (!$emailQueue) {
                return back()->with('error', 'Failed to queue eSIM email. Please try again or contact support.');
            }

            // Get the actual email that will receive the message (for the success message)
            $targetEmail = $customEmail ?? $emailService->getOrderEmail($order);

            Log::info('eSIM data resent', [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'email' => $targetEmail,
                'is_custom_email' => $customEmail !== null,
                'requested_by' => $user->id,
            ]);

            return back()->with('success', "eSIM data has been sent to {$targetEmail}. Please check your inbox.");
        } catch (\Exception $e) {
            Log::error('Failed to resend eSIM data', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);

            return back()->with('error', 'Failed to resend eSIM data. Please try again or contact support.');
        }
    }
}
