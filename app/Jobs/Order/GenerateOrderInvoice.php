<?php

namespace App\Jobs\Order;

use App\Models\Order;
use App\Services\InvoiceService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class GenerateOrderInvoice implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 5;
    public int $timeout = 60;
    public array $backoff = [10, 30, 60, 120, 300];
    public bool $deleteWhenMissingModels = true;

    public function __construct(
        public int $orderId,
    ) {}

    public function handle(InvoiceService $invoiceService): void
    {
        $order = Order::with(['customer.user', 'esimProfile', 'package', 'payment'])->find($this->orderId);

        if (!$order) {
            Log::warning('GenerateOrderInvoice: Order not found', ['order_id' => $this->orderId]);
            return;
        }

        // Only generate invoices for completed orders
        if (!$order->status->isTerminal() || $order->status->value !== 'completed') {
            Log::info('GenerateOrderInvoice: Order not completed, skipping', [
                'order_id' => $this->orderId,
                'status' => $order->status->value,
            ]);
            return;
        }

        // Skip if invoice already exists (idempotent)
        if ($invoiceService->hasOrderInvoice($order)) {
            Log::info('GenerateOrderInvoice: Invoice already exists', [
                'order_id' => $this->orderId,
            ]);
            return;
        }

        try {
            // Generate invoice with automatic duplicate prevention via DB transaction
            $invoice = $invoiceService->createPurchaseInvoice(
                $order->customer,
                $order,
                $order->payment
            );

            Log::info('GenerateOrderInvoice: Invoice generated successfully', [
                'order_id' => $this->orderId,
                'invoice_id' => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
            ]);
        } catch (\Illuminate\Database\QueryException $e) {
            // Handle database locks specifically
            if (str_contains($e->getMessage(), 'database is locked') || 
                str_contains($e->getMessage(), '5 database is locked')) {
                Log::warning('GenerateOrderInvoice: Database locked, will retry', [
                    'order_id' => $this->orderId,
                    'attempt' => $this->attempts(),
                ]);
                throw $e; // Let Laravel handle retry
            }
            
            // Handle unique constraint violations (race condition)
            if ($e->getCode() == 23000 || str_contains($e->getMessage(), 'UNIQUE constraint failed')) {
                Log::info('GenerateOrderInvoice: Invoice likely created by concurrent job', [
                    'order_id' => $this->orderId,
                ]);
                return; // Success - another job created it
            }
            
            Log::error('GenerateOrderInvoice: Database error', [
                'order_id' => $this->orderId,
                'error' => $e->getMessage(),
                'code' => $e->getCode(),
            ]);
            throw $e;
        } catch (\Exception $e) {
            Log::error('GenerateOrderInvoice: Unexpected error', [
                'order_id' => $this->orderId,
                'attempt' => $this->attempts(),
                'error' => $e->getMessage(),
                'class' => get_class($e),
            ]);
            throw $e;
        }
    }

    public function failed(\Throwable $exception): void
    {
        // Check if invoice was created by another concurrent job
        $order = Order::find($this->orderId);
        if ($order && app(InvoiceService::class)->hasOrderInvoice($order)) {
            Log::info('GenerateOrderInvoice: Invoice exists despite failures (created by other job)', [
                'order_id' => $this->orderId,
            ]);
            return;
        }

        Log::error('GenerateOrderInvoice: Job failed permanently after all retries', [
            'order_id' => $this->orderId,
            'error' => $exception->getMessage(),
            'class' => get_class($exception),
        ]);
        
        // TODO: Alert admin or add to manual review queue
        // This order needs manual invoice generation
    }
}
