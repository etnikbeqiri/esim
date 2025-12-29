<?php

namespace App\Http\Controllers\Admin;

use App\Enums\CustomerType;
use App\Events\Balance\BalanceAdjusted;
use App\Events\Balance\BalanceTopUpCompleted;
use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\CustomerBalance;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    public function index(Request $request): Response
    {
        $customers = Customer::query()
            ->with(['user:id,name,email,email_verified_at', 'balance:id,customer_id,balance,reserved'])
            ->withCount('orders')
            ->withSum('orders', 'amount')
            ->when($request->search, fn ($q, $search) => $q->whereHas('user', fn ($q) => $q->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")))
            ->when($request->type, fn ($q, $type) => $q->where('type', $type))
            ->when($request->has('active'), fn ($q) => $q->where('is_active', $request->boolean('active')))
            ->orderByDesc('created_at')
            ->paginate(50)
            ->through(fn ($customer) => [
                'id' => $customer->id,
                'type' => $customer->type->value,
                'type_label' => $customer->type->label(),
                'discount_percentage' => $customer->discount_percentage,
                'is_active' => $customer->is_active,
                'orders_count' => $customer->orders_count,
                'total_spent' => $customer->orders_sum_amount ?? 0,
                'created_at' => $customer->created_at->toISOString(),
                'user' => $customer->user ? [
                    'name' => $customer->user->name,
                    'email' => $customer->user->email,
                    'email_verified' => $customer->user->email_verified_at !== null,
                ] : null,
                'balance' => $customer->balance ? [
                    'balance' => $customer->balance->balance,
                    'available' => $customer->balance->available_balance,
                ] : null,
            ])
            ->withQueryString();

        return Inertia::render('admin/customers/index', [
            'customers' => $customers,
            'filters' => $request->only('search', 'type', 'active'),
        ]);
    }

    public function show(Request $request, Customer $customer): Response
    {
        $customer->load(['user', 'balance']);

        // Paginate orders separately
        $orders = $customer->orders()
            ->with('package:id,name')
            ->orderByDesc('created_at')
            ->paginate(15)
            ->withQueryString();

        // Calculate stats using all orders (not just paginated)
        $stats = [
            'total_orders' => $customer->orders()->count(),
            'total_spent' => $customer->orders()->sum('amount'),
            'completed_orders' => $customer->orders()->where('status', 'completed')->count(),
            'failed_orders' => $customer->orders()->where('status', 'failed')->count(),
            'pending_orders' => $customer->orders()->whereIn('status', ['pending', 'awaiting_payment', 'processing', 'pending_retry'])->count(),
        ];

        // Get recent invoices for B2B customers
        $invoices = $customer->isB2B()
            ? $customer->invoices()
                ->orderByDesc('invoice_date')
                ->limit(10)
                ->get()
                ->map(fn ($invoice) => [
                    'id' => $invoice->id,
                    'uuid' => $invoice->uuid,
                    'invoice_number' => $invoice->invoice_number,
                    'type' => $invoice->type->value,
                    'type_label' => $invoice->type->shortLabel(),
                    'status' => $invoice->status->value,
                    'status_label' => $invoice->status->label(),
                    'status_color' => $invoice->status->color(),
                    'total' => $invoice->total,
                    'invoice_date' => $invoice->invoice_date->format('M j, Y'),
                ])
            : [];

        return Inertia::render('admin/customers/show', [
            'customer' => $this->formatCustomer($customer, includeOrders: false),
            'orders' => $orders->through(fn ($order) => [
                'id' => $order->id,
                'uuid' => $order->uuid,
                'order_number' => $order->order_number,
                'status' => $order->status->value,
                'status_label' => $order->status->label(),
                'status_color' => $order->status->color(),
                'type' => $order->type->value,
                'amount' => $order->amount,
                'package_name' => $order->package?->name,
                'failure_reason' => $order->failure_reason,
                'retry_count' => $order->retry_count,
                'created_at' => $order->created_at->toISOString(),
            ]),
            'stats' => $stats,
            'invoices' => $invoices,
        ]);
    }

    public function edit(Customer $customer): Response
    {
        $customer->load(['user', 'balance']);

        return Inertia::render('admin/customers/edit', [
            'customer' => $this->formatCustomer($customer, includeOrders: false),
            'customerTypes' => collect(CustomerType::cases())->map(fn ($type) => [
                'value' => $type->value,
                'label' => $type->label(),
            ])->toArray(),
        ]);
    }

    public function update(Request $request, Customer $customer): RedirectResponse
    {
        $validated = $request->validate([
            'type' => 'required|in:b2b,b2c',
            'discount_percentage' => 'required|numeric|min:0|max:100',
            'is_active' => 'required|boolean',
            'phone' => 'nullable|string|max:50',
            'company_name' => 'nullable|string|max:255',
            'vat_number' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
            // Balance fields (only for B2B)
            'balance_amount' => 'nullable|numeric|min:0',
        ]);

        $oldType = $customer->type;
        $newType = CustomerType::from($validated['type']);

        // Update customer
        $customer->update([
            'type' => $newType,
            'discount_percentage' => $validated['discount_percentage'],
            'is_active' => $validated['is_active'],
            'phone' => $validated['phone'],
            'company_name' => $validated['company_name'],
            'vat_number' => $validated['vat_number'],
            'address' => $validated['address'],
        ]);

        // Handle balance for B2B customers
        if ($newType === CustomerType::B2B) {
            // Create balance record if it doesn't exist
            $balance = $customer->balance ?? CustomerBalance::create([
                'customer_id' => $customer->id,
                'balance' => 0,
                'reserved' => 0,
            ]);

            // If balance amount is provided and different, fire adjustment event
            if (isset($validated['balance_amount']) && $validated['balance_amount'] !== null) {
                $newBalance = (float) $validated['balance_amount'];
                $oldBalance = (float) $balance->balance;

                if ($newBalance !== $oldBalance) {
                    $difference = $newBalance - $oldBalance;

                    // Fire the balance adjustment event through Verbs
                    BalanceAdjusted::fire(
                        customer_id: $customer->id,
                        amount: abs($difference),
                        is_credit: $difference > 0,
                        description: $difference > 0
                            ? 'Admin adjustment: balance increased'
                            : 'Admin adjustment: balance decreased',
                        adjusted_by: Auth::id(),
                    );
                }
            }
        }

        // If changing from B2B to B2C, we keep the balance record but it won't be used

        return redirect()
            ->route('admin.customers.show', $customer)
            ->with('success', 'Customer updated successfully.');
    }

    public function addBalance(Request $request, Customer $customer): RedirectResponse
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'description' => 'nullable|string|max:255',
        ]);

        if (!$customer->isB2B()) {
            return back()->withErrors(['error' => 'Balance can only be added to B2B customers.']);
        }

        // Ensure balance record exists
        if (!$customer->balance) {
            CustomerBalance::create([
                'customer_id' => $customer->id,
                'balance' => 0,
                'reserved' => 0,
            ]);
        }

        $amount = (float) $validated['amount'];

        // Fire the top-up event through Verbs
        BalanceTopUpCompleted::fire(
            customer_id: $customer->id,
            amount: $amount,
            description: $validated['description'] ?? 'Admin top-up',
        );

        $currencyService = app(\App\Services\CurrencyService::class);
        $symbol = $currencyService->getDefaultCurrency()->symbol;

        return back()->with('success', "Added {$symbol}{$validated['amount']} to customer balance.");
    }

    /**
     * Update the user associated with a customer.
     */
    public function updateUser(Request $request, Customer $customer): RedirectResponse
    {
        if (!$customer->user) {
            return back()->withErrors(['error' => 'Customer has no associated user.']);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $customer->user->id,
        ]);

        $customer->user->update($validated);

        return back()->with('success', 'User details updated successfully.');
    }

    /**
     * Reset user password and return the new password or send reset link.
     */
    public function resetPassword(Request $request, Customer $customer): RedirectResponse
    {
        if (!$customer->user) {
            return back()->withErrors(['error' => 'Customer has no associated user.']);
        }

        $method = $request->input('method', 'generate');

        if ($method === 'link') {
            // Send password reset link
            Password::sendResetLink(['email' => $customer->user->email]);
            return back()->with('success', 'Password reset link sent to ' . $customer->user->email);
        }

        // Generate a new random password
        $newPassword = Str::random(12);
        $customer->user->update([
            'password' => Hash::make($newPassword),
        ]);

        return back()->with('success', 'Password reset successfully. New password: ' . $newPassword);
    }

    /**
     * Login as the customer's user (impersonation).
     */
    public function impersonate(Customer $customer): RedirectResponse
    {
        if (!$customer->user) {
            return back()->withErrors(['error' => 'Customer has no associated user.']);
        }

        // Store the admin's ID in session to allow returning
        session(['impersonating_from' => Auth::id()]);

        // Login as the customer's user
        Auth::login($customer->user);

        return redirect()->route('client.dashboard')
            ->with('success', 'You are now logged in as ' . $customer->user->name);
    }

    /**
     * Stop impersonating and return to admin account.
     */
    public function stopImpersonating(): RedirectResponse
    {
        $adminId = session('impersonating_from');

        if (!$adminId) {
            return redirect()->route('admin.customers.index');
        }

        $admin = User::find($adminId);
        if ($admin) {
            Auth::login($admin);
        }

        session()->forget('impersonating_from');

        return redirect()->route('admin.customers.index')
            ->with('success', 'Returned to admin account.');
    }

    private function formatCustomer(Customer $customer, bool $includeOrders = true): array
    {
        $data = [
            'id' => $customer->id,
            'type' => $customer->type->value,
            'type_label' => $customer->type->label(),
            'discount_percentage' => $customer->discount_percentage,
            'is_active' => $customer->is_active,
            'phone' => $customer->phone,
            'company_name' => $customer->company_name,
            'vat_number' => $customer->vat_number,
            'address' => $customer->address,
            'stripe_customer_id' => $customer->stripe_customer_id,
            'created_at' => $customer->created_at->toISOString(),
            'user' => $customer->user ? [
                'id' => $customer->user->id,
                'name' => $customer->user->name,
                'email' => $customer->user->email,
                'email_verified_at' => $customer->user->email_verified_at?->toISOString(),
            ] : null,
            'balance' => $customer->balance ? [
                'balance' => $customer->balance->balance,
                'reserved' => $customer->balance->reserved,
                'available_balance' => $customer->balance->available_balance,
            ] : null,
        ];

        if ($includeOrders && $customer->relationLoaded('orders')) {
            $data['orders'] = $customer->orders->map(fn ($order) => [
                'id' => $order->id,
                'uuid' => $order->uuid,
                'order_number' => $order->order_number,
                'status' => $order->status->value,
                'status_label' => $order->status->label(),
                'type' => $order->type->value,
                'amount' => $order->amount,
                'created_at' => $order->created_at->toISOString(),
            ])->toArray();
        }

        return $data;
    }
}
