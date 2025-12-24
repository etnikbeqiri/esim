<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BalanceTransaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @tags B2B Balance
 */
class BalanceController extends Controller
{
    /**
     * Get balance
     *
     * Returns the current balance information for the authenticated B2B account.
     * Includes total balance, reserved amount, and available balance.
     *
     * @authenticated
     *
     * @response 200 {
     *   "data": {
     *     "balance": 1000.00,
     *     "reserved": 50.00,
     *     "available": 950.00
     *   }
     * }
     * @response 403 {"error": "B2B account required"}
     */
    public function show(Request $request): JsonResponse
    {
        $customer = $request->user()->customer;

        if (!$customer || !$customer->isB2B()) {
            return response()->json([
                'error' => 'B2B account required',
            ], 403);
        }

        $balance = $customer->balance;

        return response()->json([
            'data' => [
                'balance' => $balance?->balance ?? 0,
                'reserved' => $balance?->reserved ?? 0,
                'available' => $balance?->available_balance ?? 0,
            ],
        ]);
    }

    /**
     * List balance transactions
     *
     * Returns a paginated list of balance transactions for the authenticated B2B account.
     * Transactions include top-ups, reservations, deductions, and refunds.
     *
     * @authenticated
     *
     * @queryParam type string Filter by transaction type (topup, reservation, deduction, refund). Example: deduction
     * @queryParam from_date string Filter from date (Y-m-d format). Example: 2024-01-01
     * @queryParam to_date string Filter to date (Y-m-d format). Example: 2024-12-31
     * @queryParam per_page int Items per page (max 100). Example: 20
     *
     * @response 200 {
     *   "data": [
     *     {
     *       "id": 1,
     *       "type": "deduction",
     *       "amount": 19.99,
     *       "balance_after": 980.01,
     *       "description": "Purchase: Germany 5GB",
     *       "order": {"id": 1, "order_number": "ORD-241224-ABC123"},
     *       "created_at": "2024-12-24T10:00:00Z"
     *     }
     *   ],
     *   "meta": {"current_page": 1, "last_page": 1, "per_page": 20, "total": 1}
     * }
     * @response 403 {"error": "B2B account required"}
     */
    public function transactions(Request $request): JsonResponse
    {
        $customer = $request->user()->customer;

        if (!$customer || !$customer->isB2B()) {
            return response()->json([
                'error' => 'B2B account required',
            ], 403);
        }

        $query = BalanceTransaction::with(['order'])
            ->where('customer_id', $customer->id)
            ->orderByDesc('created_at');

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Date range
        if ($request->has('from_date')) {
            $query->where('created_at', '>=', $request->from_date);
        }

        if ($request->has('to_date')) {
            $query->where('created_at', '<=', $request->to_date);
        }

        $perPage = min($request->get('per_page', 20), 100);
        $transactions = $query->paginate($perPage);

        return response()->json([
            'data' => $transactions->items(),
            'meta' => [
                'current_page' => $transactions->currentPage(),
                'last_page' => $transactions->lastPage(),
                'per_page' => $transactions->perPage(),
                'total' => $transactions->total(),
            ],
        ]);
    }
}
