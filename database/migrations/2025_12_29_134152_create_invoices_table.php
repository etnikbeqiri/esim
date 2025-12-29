<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('invoice_number', 20)->unique();

            // Customer relationship
            $table->foreignId('customer_id')->constrained()->onDelete('restrict');

            // Source relationships
            $table->foreignId('order_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('balance_transaction_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('payment_id')->nullable()->constrained()->onDelete('set null');

            // Invoice type and status
            $table->string('type', 20); // InvoiceType enum: top_up, purchase, statement
            $table->string('status', 20)->default('issued'); // InvoiceStatus: draft, issued, paid, voided

            // Dates
            $table->date('invoice_date');
            $table->date('due_date')->nullable();
            $table->timestamp('issued_at')->nullable();
            $table->timestamp('paid_at')->nullable();

            // Seller details (snapshot at invoice time)
            $table->json('seller_details');

            // Buyer details (snapshot at invoice time)
            $table->json('buyer_details');

            // Financial totals
            $table->decimal('subtotal', 12, 2);
            $table->decimal('vat_rate', 5, 2)->default(0.00);
            $table->decimal('vat_amount', 12, 2)->default(0.00);
            $table->decimal('total', 12, 2);
            $table->foreignId('currency_id')->nullable()->constrained()->nullOnDelete();

            // Balance context (for top-up invoices)
            $table->decimal('balance_before', 12, 2)->nullable();
            $table->decimal('balance_after', 12, 2)->nullable();

            // Payment reference
            $table->string('payment_method', 50)->nullable();
            $table->string('payment_reference', 100)->nullable();

            // Line items stored as JSON for flexibility
            $table->json('line_items');

            // Notes and metadata
            $table->text('notes')->nullable();
            $table->json('metadata')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['customer_id', 'type']);
            $table->index('invoice_number');
            $table->index('invoice_date');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
