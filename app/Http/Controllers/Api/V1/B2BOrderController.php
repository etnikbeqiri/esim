<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\OrderType;
use App\Events\Balance\BalanceDeducted;
use App\Events\Balance\BalanceReserved;
use App\Events\Order\OrderCreated;
use App\Events\Order\OrderProcessingStarted;
use App\Http\Controllers\Controller;
use App\Models\Package;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * @tags B2B Orders
 */
class B2BOrderController extends Controller
{
    /**
     * Create B2B order
     *
     * Creates a new order using B2B account balance. The order is processed immediately
     * and the eSIM will be provisioned automatically. Balance is deducted upon order creation.
     *
     * @authenticated
     *
     * @bodyParam package_id int required The ID of the package to purchase. Example: 1
     *
     * @response 201 {
     *   "data": {
     *     "order_id": 1,
     *     "order_uuid": "550e8400-e29b-41d4-a716-446655440000",
     *     "order_number": "ORD-241224-ABC123",
     *     "status": "processing",
     *     "amount": 19.99,
     *     "message": "Order created and processing"
     *   }
     * }
     * @response 403 {"error": "B2B account required"}
     * @response 422 {"error": "Package not available"}
     * @response 422 {"error": "Insufficient balance", "required": 19.99, "available": 10.00}
     * @response 500 {"error": "Failed to create order", "message": "..."}
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'package_id' => 'required|exists:packages,id',
        ]);

        $customer = $request->user()->customer;

        if (!$customer || !$customer->isB2B()) {
            return response()->json([
                'error' => 'B2B account required',
            ], 403);
        }

        $package = Package::with('provider')->find($request->package_id);

        if (!$package->isAvailable()) {
            return response()->json([
                'error' => 'Package not available',
            ], 422);
        }

        // Calculate price with discount (using effective price which considers custom pricing)
        $price = $customer->calculateDiscountedPrice((float) $package->effective_retail_price);

        // Check balance
        $balance = $customer->balance;
        if (!$balance || !$balance->canDeduct($price)) {
            return response()->json([
                'error' => 'Insufficient balance',
                'required' => $price,
                'available' => $balance?->available_balance ?? 0,
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Create order
            $order = OrderCreated::commit(
                customer_id: $customer->id,
                package_id: $package->id,
                provider_id: $package->provider_id,
                type: OrderType::B2B,
                amount: $price,
                cost_price: $package->cost_price,
                customer_email: $customer->user->email,
                customer_name: $customer->display_name,
                ip_address: $request->ip(),
                user_agent: $request->userAgent(),
            );

            // Reserve balance
            BalanceReserved::fire(
                customer_id: $customer->id,
                amount: $price,
                order_id: $order->id,
                description: "Order #{$order->order_number}",
            );

            // Deduct balance (convert reservation)
            BalanceDeducted::fire(
                customer_id: $customer->id,
                amount: $price,
                order_id: $order->id,
                description: "Purchase: {$package->name}",
                from_reservation: true,
            );

            // Start processing (triggers provider purchase job)
            OrderProcessingStarted::fire(order_id: $order->id);

            DB::commit();

            return response()->json([
                'data' => [
                    'order_id' => $order->id,
                    'order_uuid' => $order->uuid,
                    'order_number' => $order->order_number,
                    'status' => $order->status->value,
                    'amount' => $price,
                    'message' => 'Order created and processing',
                ],
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'error' => 'Failed to create order',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
