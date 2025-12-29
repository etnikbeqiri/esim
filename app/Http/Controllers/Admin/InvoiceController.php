<?php

namespace App\Http\Controllers\Admin;

use App\Enums\BalanceTransactionType;
use App\Enums\InvoiceStatus;
use App\Enums\InvoiceType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\GenerateInvoiceRequest;
use App\Models\BalanceTransaction;
use App\Models\Currency;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\Order;
use App\Services\InvoiceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class InvoiceController extends Controller
{
    public function __construct(
        private readonly InvoiceService $invoiceService,
    ) {}

    public function index(Request $request): InertiaResponse
    {
        $invoices = Invoice::query()
            ->with(['customer.user:id,name,email'])
            ->when($request->search, fn ($q, $search) => $q->where('invoice_number', 'like', "%{$search}%")
                ->orWhereHas('customer.user', fn ($q) => $q->where('email', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%")))
            ->when($request->type, fn ($q, $type) => $q->where('type', $type))
            ->when($request->status, fn ($q, $status) => $q->where('status', $status))
            ->when($request->customer_id, fn ($q, $customerId) => $q->where('customer_id', $customerId))
            ->orderByDesc('invoice_date')
            ->orderByDesc('id')
            ->paginate(50)
            ->through(fn ($invoice) => [
                'id' => $invoice->id,
                'uuid' => $invoice->uuid,
                'invoice_number' => $invoice->invoice_number,
                'type' => $invoice->type->value,
                'type_label' => $invoice->type->shortLabel(),
                'status' => $invoice->status->value,
                'status_label' => $invoice->status->label(),
                'status_color' => $invoice->status->color(),
                'total' => $invoice->total,
                'currency_code' => $invoice->currency_code,
                'invoice_date' => $invoice->invoice_date->format('M j, Y'),
                'customer' => $invoice->customer ? [
                    'id' => $invoice->customer->id,
                    'user' => $invoice->customer->user ? [
                        'name' => $invoice->customer->user->name,
                        'email' => $invoice->customer->user->email,
                    ] : null,
                ] : null,
            ])
            ->withQueryString();

        return Inertia::render('admin/invoices/index', [
            'invoices' => $invoices,
            'types' => collect(InvoiceType::cases())->map(fn ($t) => [
                'value' => $t->value,
                'label' => $t->shortLabel(),
            ]),
            'statuses' => collect(InvoiceStatus::cases())->map(fn ($s) => [
                'value' => $s->value,
                'label' => $s->label(),
                'color' => $s->color(),
            ]),
            'filters' => $request->only('search', 'type', 'status', 'customer_id'),
            'defaultCurrency' => Currency::getDefault(),
        ]);
    }

    public function show(Invoice $invoice): InertiaResponse
    {
        $invoice->load(['customer.user', 'order', 'balanceTransaction', 'payment']);

        return Inertia::render('admin/invoices/show', [
            ...$this->invoiceService->getViewData($invoice),
            'order' => $invoice->order ? [
                'id' => $invoice->order->id,
                'uuid' => $invoice->order->uuid,
                'order_number' => $invoice->order->order_number,
            ] : null,
            'customer' => $invoice->customer ? [
                'id' => $invoice->customer->id,
                'company_name' => $invoice->customer->company_name,
                'user' => $invoice->customer->user ? [
                    'name' => $invoice->customer->user->name,
                    'email' => $invoice->customer->user->email,
                ] : null,
            ] : null,
            'defaultCurrency' => Currency::getDefault(),
        ]);
    }

    public function download(Invoice $invoice): Response
    {
        $pdf = $this->invoiceService->generatePdf($invoice);

        return response($pdf, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="'.$invoice->invoice_number.'.pdf"',
        ]);
    }

    public function generate(Request $request): InertiaResponse
    {
        $preselectedCustomer = null;
        if ($request->customer_id) {
            $customer = Customer::with('user:id,name,email')->find($request->customer_id);
            if ($customer) {
                $preselectedCustomer = [
                    'id' => $customer->id,
                    'name' => $customer->user?->name,
                    'email' => $customer->user?->email,
                    'company_name' => $customer->company_name,
                    'type' => $customer->type->value,
                    'has_balance' => $customer->hasBalance(),
                ];
            }
        }

        return Inertia::render('admin/invoices/generate', [
            'types' => collect(InvoiceType::cases())->map(fn ($t) => [
                'value' => $t->value,
                'label' => $t->shortLabel(),
            ]),
            'defaultCurrency' => Currency::getDefault(),
            'preselectedCustomer' => $preselectedCustomer,
        ]);
    }

    public function searchCustomers(Request $request): JsonResponse
    {
        $customers = Customer::query()
            ->with('user:id,name,email')
            ->when($request->search, fn ($q, $search) => $q->whereHas('user', fn ($q) => $q->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%")
            )->orWhere('company_name', 'like', "%{$search}%"))
            ->limit(20)
            ->get()
            ->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->user?->name,
                'email' => $c->user?->email,
                'company_name' => $c->company_name,
                'type' => $c->type->value,
                'has_balance' => $c->hasBalance(),
            ]);

        return response()->json($customers);
    }

    public function uninvoicedOrders(Request $request, Customer $customer): JsonResponse
    {
        $validated = $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $orders = $customer->orders()
            ->with('package:id,name')
            ->completed()
            ->whereDoesntHave('invoice', fn ($q) => $q->where('type', InvoiceType::Purchase)
                ->where('status', '!=', InvoiceStatus::Voided)
            )
            ->when($validated['start_date'] ?? null, fn ($q, $date) => $q->whereDate('completed_at', '>=', $date))
            ->when($validated['end_date'] ?? null, fn ($q, $date) => $q->whereDate('completed_at', '<=', $date))
            ->orderByDesc('completed_at')
            ->get()
            ->map(fn ($order) => [
                'id' => $order->id,
                'uuid' => $order->uuid,
                'order_number' => $order->order_number,
                'type' => $order->type->value,
                'amount' => (float) $order->amount,
                'package_name' => $order->package?->name,
                'completed_at' => $order->completed_at?->format('Y-m-d H:i'),
            ]);

        return response()->json($orders);
    }

    public function uninvoicedTransactions(Request $request, Customer $customer): JsonResponse
    {
        $validated = $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        if (! $customer->hasBalance()) {
            return response()->json([]);
        }

        $transactions = BalanceTransaction::where('customer_id', $customer->id)
            ->where('type', BalanceTransactionType::TopUp)
            ->with('payment:id,provider,transaction_id')
            ->whereNotExists(fn ($q) => $q->select(DB::raw(1))
                ->from('invoices')
                ->whereColumn('invoices.balance_transaction_id', 'balance_transactions.id')
                ->where('invoices.type', InvoiceType::TopUp->value)
                ->where('invoices.status', '!=', InvoiceStatus::Voided->value)
            )
            ->when($validated['start_date'] ?? null, fn ($q, $date) => $q->whereDate('created_at', '>=', $date))
            ->when($validated['end_date'] ?? null, fn ($q, $date) => $q->whereDate('created_at', '<=', $date))
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($tx) => [
                'id' => $tx->id,
                'uuid' => $tx->uuid,
                'amount' => (float) $tx->amount,
                'description' => $tx->description,
                'balance_before' => (float) $tx->balance_before,
                'balance_after' => (float) $tx->balance_after,
                'payment_method' => $tx->payment?->provider?->label(),
                'created_at' => $tx->created_at->format('Y-m-d H:i'),
            ]);

        return response()->json($transactions);
    }

    public function store(GenerateInvoiceRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $customer = Customer::findOrFail($validated['customer_id']);
        $type = InvoiceType::from($validated['type']);
        $createdInvoices = [];

        DB::transaction(function () use ($customer, $type, $validated, &$createdInvoices) {
            switch ($type) {
                case InvoiceType::Purchase:
                    $orders = Order::whereIn('uuid', $validated['order_ids'])
                        ->where('customer_id', $customer->id)
                        ->completed()
                        ->with('payment')
                        ->get();

                    foreach ($orders as $order) {
                        if (! $this->invoiceService->hasOrderInvoice($order)) {
                            $invoice = $this->invoiceService->createPurchaseInvoice(
                                $customer,
                                $order,
                                $order->payment
                            );
                            $createdInvoices[] = $invoice;
                        }
                    }
                    break;

                case InvoiceType::TopUp:
                    $transactions = BalanceTransaction::whereIn('uuid', $validated['transaction_ids'])
                        ->where('customer_id', $customer->id)
                        ->where('type', BalanceTransactionType::TopUp)
                        ->with('payment')
                        ->get();

                    foreach ($transactions as $transaction) {
                        if (! $this->invoiceService->hasTopUpInvoice($transaction)) {
                            $invoice = $this->invoiceService->createTopUpInvoice(
                                $customer,
                                $transaction,
                                $transaction->payment
                            );
                            $createdInvoices[] = $invoice;
                        }
                    }
                    break;

                case InvoiceType::Statement:
                    $invoice = $this->invoiceService->generateAccountStatement(
                        $customer,
                        new \DateTime($validated['start_date']),
                        new \DateTime($validated['end_date'])
                    );
                    $createdInvoices[] = $invoice;
                    break;
            }
        });

        $count = count($createdInvoices);
        if ($count === 0) {
            return back()->with('error', 'No invoices created. Items may already have invoices.');
        }

        if ($count === 1) {
            return redirect()->route('admin.invoices.show', $createdInvoices[0])
                ->with('success', 'Invoice created successfully.');
        }

        return redirect()->route('admin.invoices.index', ['customer_id' => $customer->id])
            ->with('success', "{$count} invoices created successfully.");
    }

    public function void(Invoice $invoice)
    {
        if ($invoice->status === InvoiceStatus::Voided) {
            return back()->with('error', 'Invoice is already voided.');
        }

        $invoice->markAsVoided();

        return back()->with('success', 'Invoice has been voided.');
    }
}
