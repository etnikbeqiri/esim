<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @tags Orders
 */
class OrderController extends Controller
{
    /**
     * List orders
     *
     * Returns a paginated list of orders for the authenticated user.
     * Orders are sorted by creation date, newest first.
     *
     * @authenticated
     *
     * @queryParam status string Filter by order status (pending, processing, completed, failed, cancelled). Example: completed
     * @queryParam per_page int Items per page (max 100). Example: 20
     *
     * @response 200 {
     *   "data": [
     *     {
     *       "id": 1,
     *       "uuid": "550e8400-e29b-41d4-a716-446655440000",
     *       "order_number": "ORD-241224-ABC123",
     *       "status": "completed",
     *       "amount": 19.99,
     *       "package": {"id": 1, "name": "Germany 5GB", "country": {"name": "Germany"}},
     *       "esim_profile": {"iccid": "89..."}
     *     }
     *   ],
     *   "meta": {"current_page": 1, "last_page": 1, "per_page": 20, "total": 1}
     * }
     */
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

    /**
     * Get order details
     *
     * Returns detailed information about a specific order including
     * package details, payment history, and eSIM profile if available.
     *
     * @authenticated
     *
     * @response 200 {
     *   "data": {
     *     "id": 1,
     *     "uuid": "550e8400-e29b-41d4-a716-446655440000",
     *     "order_number": "ORD-241224-ABC123",
     *     "status": "completed",
     *     "payment_status": "completed",
     *     "amount": 19.99,
     *     "package": {"id": 1, "name": "Germany 5GB"},
     *     "provider": {"id": 1, "name": "Provider"},
     *     "esim_profile": {"iccid": "89..."},
     *     "payments": []
     *   }
     * }
     * @response 404 {"error": "Order not found"}
     */
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

    /**
     * Get eSIM details
     *
     * Returns the eSIM activation details for a completed order including
     * ICCID, activation code, QR code data, and data usage information.
     *
     * @authenticated
     *
     * @response 200 {
     *   "data": {
     *     "iccid": "8901234567890123456",
     *     "activation_code": "LPA:1$...",
     *     "smdp_address": "smdp.example.com",
     *     "lpa_string": "LPA:1$...",
     *     "qr_code_data": "LPA:1$...",
     *     "apn": "internet",
     *     "status": "active",
     *     "data_used_mb": 512,
     *     "data_total_mb": 5120,
     *     "data_remaining_mb": 4608,
     *     "data_usage_percentage": 10,
     *     "is_activated": true,
     *     "activated_at": "2024-12-24T10:00:00Z",
     *     "expires_at": "2025-01-24T10:00:00Z"
     *   }
     * }
     * @response 404 {"error": "Order not found"}
     * @response 404 {"error": "eSIM not yet available"}
     */
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

    /**
     * Cancel order
     *
     * Cancels an order if it's in a cancellable state (pending or awaiting payment).
     * For B2B orders, the reserved balance will be refunded.
     *
     * @authenticated
     *
     * @bodyParam reason string Optional cancellation reason. Example: Changed my mind
     *
     * @response 200 {"message": "Order cancelled successfully"}
     * @response 404 {"error": "Order not found"}
     * @response 422 {"error": "Order cannot be cancelled in current status"}
     */
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
