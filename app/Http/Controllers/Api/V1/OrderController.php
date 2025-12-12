<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $customer = $request->user()->customer;

        if (!$customer) {
            return response()->json(['data' => [], 'meta' => ['total' => 0]]);
        }

        $query = Order::with(['package.country', 'esimProfile'])
            ->where('customer_id', $customer->id)
            ->orderByDesc('created_at');

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $perPage = min($request->get('per_page', 20), 100);
        $orders = $query->paginate($perPage);

        return response()->json([
            'data' => $orders->items(),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
            ],
        ]);
    }

    public function show(Request $request, Order $order): JsonResponse
    {
        $customer = $request->user()->customer;

        if (!$customer || $order->customer_id !== $customer->id) {
            return response()->json(['error' => 'Order not found'], 404);
        }

        $order->load(['package.country', 'provider', 'esimProfile', 'payments']);

        return response()->json([
            'data' => $order,
        ]);
    }

    public function esimDetails(Request $request, Order $order): JsonResponse
    {
        $customer = $request->user()->customer;

        if (!$customer || $order->customer_id !== $customer->id) {
            return response()->json(['error' => 'Order not found'], 404);
        }

        if (!$order->esimProfile) {
            return response()->json(['error' => 'eSIM not yet available'], 404);
        }

        $esim = $order->esimProfile;

        return response()->json([
            'data' => [
                'iccid' => $esim->iccid,
                'activation_code' => $esim->activation_code,
                'smdp_address' => $esim->smdp_address,
                'lpa_string' => $esim->lpa_string,
                'qr_code_data' => $esim->qr_code_data,
                'apn' => $esim->apn,
                'status' => $esim->status,
                'data_used_mb' => $esim->data_used_mb,
                'data_total_mb' => $esim->data_total_mb,
                'data_remaining_mb' => $esim->data_remaining_mb,
                'data_usage_percentage' => $esim->data_usage_percentage,
                'is_activated' => $esim->is_activated,
                'activated_at' => $esim->activated_at,
                'expires_at' => $esim->expires_at,
            ],
        ]);
    }

    public function cancel(Request $request, Order $order): JsonResponse
    {
        $customer = $request->user()->customer;

        if (!$customer || $order->customer_id !== $customer->id) {
            return response()->json(['error' => 'Order not found'], 404);
        }

        if (!$order->canTransitionTo(\App\Enums\OrderStatus::Cancelled)) {
            return response()->json([
                'error' => 'Order cannot be cancelled in current status',
            ], 422);
        }

        \App\Events\Order\OrderCancelled::fire(
            order_id: $order->id,
            cancellation_reason: $request->get('reason', 'Cancelled by customer'),
        );

        return response()->json([
            'message' => 'Order cancelled successfully',
        ]);
    }
}
