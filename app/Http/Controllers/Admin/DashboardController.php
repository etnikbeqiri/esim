<?php

namespace App\Http\Controllers\Admin;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Package;
use App\Models\Payment;
use App\Models\SyncJob;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        // Revenue stats
        $today = Carbon::today();
        $thisMonth = Carbon::now()->startOfMonth();
        $lastMonth = Carbon::now()->subMonth()->startOfMonth();
        $lastMonthEnd = Carbon::now()->subMonth()->endOfMonth();

        $todayRevenue = Order::where('status', OrderStatus::Completed)
            ->whereDate('completed_at', $today)
            ->sum('amount');

        $thisMonthRevenue = Order::where('status', OrderStatus::Completed)
            ->where('completed_at', '>=', $thisMonth)
            ->sum('amount');

        $lastMonthRevenue = Order::where('status', OrderStatus::Completed)
            ->whereBetween('completed_at', [$lastMonth, $lastMonthEnd])
            ->sum('amount');

        $totalRevenue = Order::where('status', OrderStatus::Completed)->sum('amount');
        $totalProfit = Order::where('status', OrderStatus::Completed)->sum('profit');

        // Order stats
        $totalOrders = Order::count();
        $completedOrders = Order::where('status', OrderStatus::Completed)->count();
        $pendingOrders = Order::whereIn('status', [
            OrderStatus::Pending,
            OrderStatus::AwaitingPayment,
            OrderStatus::Processing,
            OrderStatus::PendingRetry,
        ])->count();
        $failedOrders = Order::where('status', OrderStatus::Failed)->count();

        // Today's orders
        $todayOrders = Order::whereDate('created_at', $today)->count();
        $todayCompletedOrders = Order::whereDate('created_at', $today)
            ->where('status', OrderStatus::Completed)
            ->count();

        // Customer stats
        $totalCustomers = Customer::count();
        $b2bCustomers = Customer::where('type', 'b2b')->count();
        $b2cCustomers = Customer::where('type', 'b2c')->count();
        $newCustomersToday = Customer::whereDate('created_at', $today)->count();
        $newCustomersThisMonth = Customer::where('created_at', '>=', $thisMonth)->count();

        // Package stats
        $totalPackages = Package::count();
        $activePackages = Package::where('is_active', true)->count();

        // Recent orders (for activity feed)
        $recentOrders = Order::with(['customer.user:id,name,email', 'package:id,name'])
            ->latest()
            ->take(10)
            ->get()
            ->map(fn ($order) => [
                'id' => $order->id,
                'uuid' => $order->uuid,
                'order_number' => $order->order_number,
                'status' => $order->status->value,
                'status_label' => $order->status->label(),
                'status_color' => $order->status->color(),
                'type' => $order->type->value,
                'amount' => (float) $order->amount,
                'customer_name' => $order->customer?->user?->name ?? $order->customer_name ?? 'Guest',
                'customer_email' => $order->customer?->user?->email ?? $order->customer_email,
                'package_name' => $order->package?->name,
                'created_at' => $order->created_at->diffForHumans(),
            ]);

        // Orders needing attention
        $ordersNeedingAttention = Order::whereIn('status', [
            OrderStatus::AwaitingPayment,
            OrderStatus::PendingRetry,
            OrderStatus::Failed,
        ])
            ->with(['customer.user:id,name,email', 'package:id,name'])
            ->latest()
            ->take(5)
            ->get()
            ->map(fn ($order) => [
                'id' => $order->id,
                'uuid' => $order->uuid,
                'order_number' => $order->order_number,
                'status' => $order->status->value,
                'status_label' => $order->status->label(),
                'status_color' => $order->status->color(),
                'failure_reason' => $order->failure_reason,
                'retry_count' => $order->retry_count,
                'amount' => (float) $order->amount,
                'customer_name' => $order->customer?->user?->name ?? $order->customer_name ?? 'Guest',
                'package_name' => $order->package?->name,
                'created_at' => $order->created_at->diffForHumans(),
            ]);

        // Recent sync jobs
        $recentSyncJobs = SyncJob::with('provider:id,name')
            ->latest()
            ->take(5)
            ->get()
            ->map(fn ($job) => [
                'id' => $job->id,
                'type' => $job->type->value,
                'type_label' => $job->type->label(),
                'status' => $job->status->value,
                'status_label' => $job->status->label(),
                'provider_name' => $job->provider?->name,
                'progress' => $job->progress,
                'total' => $job->total,
                'created_at' => $job->created_at->diffForHumans(),
            ]);

        // Revenue trend (last 7 days)
        $revenueTrend = collect(range(6, 0))->map(function ($daysAgo) {
            $date = Carbon::today()->subDays($daysAgo);
            $revenue = Order::where('status', OrderStatus::Completed)
                ->whereDate('completed_at', $date)
                ->sum('amount');
            return [
                'date' => $date->format('M j'),
                'revenue' => (float) $revenue,
            ];
        });

        // Order trend (last 7 days)
        $orderTrend = collect(range(6, 0))->map(function ($daysAgo) {
            $date = Carbon::today()->subDays($daysAgo);
            $orders = Order::whereDate('created_at', $date)->count();
            $completed = Order::whereDate('created_at', $date)
                ->where('status', OrderStatus::Completed)
                ->count();
            return [
                'date' => $date->format('M j'),
                'total' => $orders,
                'completed' => $completed,
            ];
        });

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'revenue' => [
                    'today' => (float) $todayRevenue,
                    'this_month' => (float) $thisMonthRevenue,
                    'last_month' => (float) $lastMonthRevenue,
                    'total' => (float) $totalRevenue,
                    'total_profit' => (float) $totalProfit,
                ],
                'orders' => [
                    'total' => $totalOrders,
                    'completed' => $completedOrders,
                    'pending' => $pendingOrders,
                    'failed' => $failedOrders,
                    'today' => $todayOrders,
                    'today_completed' => $todayCompletedOrders,
                ],
                'customers' => [
                    'total' => $totalCustomers,
                    'b2b' => $b2bCustomers,
                    'b2c' => $b2cCustomers,
                    'new_today' => $newCustomersToday,
                    'new_this_month' => $newCustomersThisMonth,
                ],
                'packages' => [
                    'total' => $totalPackages,
                    'active' => $activePackages,
                ],
            ],
            'recentOrders' => $recentOrders,
            'ordersNeedingAttention' => $ordersNeedingAttention,
            'recentSyncJobs' => $recentSyncJobs,
            'revenueTrend' => $revenueTrend,
            'orderTrend' => $orderTrend,
        ]);
    }
}
