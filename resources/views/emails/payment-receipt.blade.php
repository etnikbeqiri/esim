<x-email.layout title="Payment Receipt">
    <x-email.heading>Payment Receipt</x-email.heading>

    <x-email.text>Hello {{ $customerName ?? 'there' }},</x-email.text>

    <x-email.text>Thank you for your payment. Here's your receipt for order #{{ $order->order_number }}.</x-email.text>

    <x-email.table title="Payment Details">
        <x-email.table-row label="Order Number" :value="'#' . $order->order_number" />
        <x-email.table-row label="Date" :value="$order->paid_at?->format('F j, Y') ?? now()->format('F j, Y')" />
        <x-email.table-row label="Payment Method" :value="ucfirst($payment->provider?->value ?? 'Card')" />
        @if($payment->transaction_id ?? false)
            <x-email.table-row label="Transaction ID" :value="$payment->transaction_id" />
        @endif
    </x-email.table>

    <x-email.summary>
        <x-email.summary-row :label="$package->name" :value="$currency . number_format($order->amount, 2)" />
        <x-email.summary-row :label="'Data: ' . $package->data_label" value="" />
        <x-email.summary-row :label="'Validity: ' . $package->validity_label" value="" />
        <x-email.summary-row label="Total Paid" :value="$currency . number_format($order->amount, 2)" :bold="true" />
    </x-email.summary>

    <x-email.divider />

    <x-email.text muted small>
        This receipt confirms your payment has been processed successfully. Keep this email for your records.
    </x-email.text>

    <div style="text-align: center; margin-top: 16px;">
        <x-email.button :href="config('app.url') . '/client/orders/' . $order->uuid">View Order Details</x-email.button>
    </div>
</x-email.layout>
