<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Services\InvoiceService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class InvoiceController extends Controller
{
    public function __construct(
        private readonly InvoiceService $invoiceService,
    ) {}

    /**
     * List all invoices for the authenticated customer.
     */
    public function index(Request $request): InertiaResponse|RedirectResponse
    {
        $customer = $request->user()->customer;

        if (! $customer) {
            return redirect()->route('client.dashboard')
                ->with('error', 'Customer account required.');
        }

        $invoices = $this->invoiceService->getCustomerInvoices($customer);

        return Inertia::render('client/invoices/index', [
            'invoices' => $this->invoiceService->transformInvoices($invoices),
        ]);
    }

    /**
     * Show a single invoice (HTML view).
     */
    public function show(Request $request, Invoice $invoice): InertiaResponse|RedirectResponse
    {
        $customer = $request->user()->customer;

        if (! $customer || $invoice->customer_id !== $customer->id) {
            return redirect()->route('client.invoices.index')
                ->with('error', 'Invoice not found.');
        }

        return Inertia::render('client/invoices/show', $this->invoiceService->getViewData($invoice));
    }

    /**
     * Download invoice as PDF.
     */
    public function download(Request $request, Invoice $invoice): Response|RedirectResponse
    {
        $customer = $request->user()->customer;

        if (! $customer || $invoice->customer_id !== $customer->id) {
            return redirect()->route('client.invoices.index')
                ->with('error', 'Invoice not found.');
        }

        $pdf = $this->invoiceService->generatePdf($invoice);

        $disposition = $request->has('print') ? 'inline' : 'attachment';

        return response($pdf, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => $disposition.'; filename="'.$invoice->invoice_number.'.pdf"',
        ]);
    }

    /**
     * Generate account statement.
     */
    public function statement(Request $request): InertiaResponse|Response|RedirectResponse
    {
        $customer = $request->user()->customer;

        if (! $customer || ! $customer->isB2B()) {
            return redirect()->route('client.dashboard')
                ->with('error', 'Statements are only available for B2B accounts.');
        }

        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'format' => 'sometimes|in:html,pdf',
        ]);

        $invoice = $this->invoiceService->generateAccountStatement(
            $customer,
            new \DateTime($validated['start_date']),
            new \DateTime($validated['end_date'])
        );

        if (($validated['format'] ?? 'html') === 'pdf') {
            $pdf = $this->invoiceService->generatePdf($invoice);

            return response($pdf, 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'attachment; filename="'.$invoice->invoice_number.'.pdf"',
            ]);
        }

        return Inertia::render('client/invoices/show', $this->invoiceService->getViewData($invoice));
    }
}
