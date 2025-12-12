<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BalanceTransaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BalanceController extends Controller
{
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
