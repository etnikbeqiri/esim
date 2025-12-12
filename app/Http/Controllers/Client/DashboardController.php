<?php

namespace App\Http\Controllers\Client;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\BalanceTransaction;
use App\Models\Order;
use App\Models\Package;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // Admins should use admin dashboard
        if ($user->isAdmin()) {
            return redirect()->route('admin.dashboard');
        }

        $customer = $user->customer;

        // Get recent orders with more details
        $recentOrders = $customer
            ? Order::where('customer_id', $customer->id)
                ->with(['package.country', 'esimProfile'])
                ->latest()
                ->take(5)
                ->get()
                ->map(fn($order) => [
                    'uuid' => $order->uuid,
                    'order_number' => $order->order_number,
                    'status' => $order->status->value,
                    'status_label' => $order->status->label(),
                    'status_color' => $order->status->color(),
                    'amount' => $order->amount,
                    'package_name' => $order->package?->name,
                    'country_name' => $order->package?->country?->name,
                    'country_iso' => $order->package?->country?->iso_code,
                    'data_label' => $order->package?->data_label,
                    'has_esim' => $order->esimProfile !== null,
                    'esim_status' => $order->esimProfile?->status?->value,
                    'created_at' => $order->created_at->diffForHumans(),
                    'created_at_date' => $order->created_at->format('M j, Y'),
                ])
            : [];

        // Get featured packages
        $featuredPackages = Package::with(['country', 'provider'])
            ->available()
            ->featured()
            ->take(6)
            ->get()
            ->map(fn($pkg) => [
                'id' => $pkg->id,
                'name' => $pkg->name,
                'country' => $pkg->country?->name,
                'country_iso' => $pkg->country?->iso_code,
                'data_label' => $pkg->data_label,
                'validity_label' => $pkg->validity_label,
                'price' => $pkg->effective_retail_price,
            ]);

        // Calculate stats
        $stats = null;
        $balanceHistory = [];

        if ($customer) {
            $thisMonth = Carbon::now()->startOfMonth();

            $stats = [
                'total_orders' => Order::where('customer_id', $customer->id)->count(),
                'completed_orders' => Order::where('customer_id', $customer->id)->completed()->count(),
                'pending_orders' => Order::where('customer_id', $customer->id)
                    ->whereIn('status', [
                        OrderStatus::Pending,
                        OrderStatus::AwaitingPayment,
                        OrderStatus::Processing,
                        OrderStatus::PendingRetry,
                    ])->count(),
                'active_esims' => Order::where('customer_id', $customer->id)
                    ->completed()
                    ->whereHas('esimProfile')
                    ->count(),
                'total_spent' => Order::where('customer_id', $customer->id)
                    ->where('status', OrderStatus::Completed)
                    ->sum('amount'),
                'spent_this_month' => Order::where('customer_id', $customer->id)
                    ->where('status', OrderStatus::Completed)
                    ->where('completed_at', '>=', $thisMonth)
                    ->sum('amount'),
            ];

            // Get balance history for B2B customers
            if ($customer->isB2B()) {
                $balanceHistory = BalanceTransaction::where('customer_id', $customer->id)
                    ->latest()
                    ->take(5)
                    ->get()
                    ->map(fn($tx) => [
                        'id' => $tx->id,
                        'type' => $tx->type->value,
                        'type_label' => $tx->type->label(),
                        'amount' => $tx->amount,
                        'balance_after' => $tx->balance_after,
                        'description' => $tx->description,
                        'created_at' => $tx->created_at->diffForHumans(),
                    ]);
            }
        }

        // Get active eSIMs with usage info
        $activeEsims = $customer
            ? Order::where('customer_id', $customer->id)
                ->completed()
                ->whereHas('esimProfile')
                ->with(['esimProfile', 'package.country'])
                ->latest()
                ->take(3)
                ->get()
                ->map(fn($order) => [
                    'order_uuid' => $order->uuid,
                    'iccid' => $order->esimProfile->iccid,
                    'status' => $order->esimProfile->status?->value ?? 'unknown',
                    'country' => $order->package?->country?->name,
                    'country_iso' => $order->package?->country?->iso_code,
                    'data_used_bytes' => $order->esimProfile->data_used_bytes ?? 0,
                    'data_total_bytes' => $order->esimProfile->data_total_bytes ?? ($order->package?->data_mb * 1024 * 1024),
                    'package_name' => $order->package?->name,
                ])
            : [];

        return Inertia::render('client/dashboard', [
            'customer' => $customer ? [
                'type' => $customer->type->value,
                'type_label' => $customer->type->label(),
                'is_b2b' => $customer->isB2B(),
                'balance' => $customer->isB2B() ? $customer->balance?->balance : null,
                'available_balance' => $customer->isB2B() ? $customer->available_balance : null,
                'reserved_balance' => $customer->isB2B() ? $customer->balance?->reserved : null,
                'discount_percentage' => $customer->discount_percentage,
                'display_name' => $customer->display_name,
                'company_name' => $customer->company_name,
            ] : null,
            'recentOrders' => $recentOrders,
            'featuredPackages' => $featuredPackages,
            'activeEsims' => $activeEsims,
            'balanceHistory' => $balanceHistory,
            'stats' => $stats,
        ]);
    }
}
