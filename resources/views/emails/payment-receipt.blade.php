<x-email.layout title="Payment Receipt">
    <x-email.heading>Payment Receipt</x-email.heading>

    <x-email.text>Hello {{ $customerName ?? 'there' }},</x-email.text>

    <x-email.text>Thank you for your payment. This email serves as your official receipt for transaction #{{ $order->order_number }}.</x-email.text>

    <x-email.summary>
        <x-email.summary-row label="Order Number" :value="'#' . $order->order_number" />
        <x-email.summary-row label="Transaction Date" :value="$order->paid_at?->format('F j, Y') ?? now()->format('F j, Y')" />
        <x-email.summary-row label="Payment Method" :value="ucfirst($payment->provider?->value ?? 'Card')" />
        @if($payment->transaction_id ?? false)
            <x-email.summary-row label="Transaction ID" :value="$payment->transaction_id" />
        @endif
    </x-email.summary>

    <x-email.summary>
        <x-email.summary-row :label="$package->name" :value="number_format($order->amount, 2) . ' ' . config('invoice.currency')" />
        <x-email.summary-row :label="'Data: ' . $package->data_label" value="" />
        <x-email.summary-row :label="'Duration: ' . $package->validity_label" value="" />
        <x-email.summary-row label="Total Charged" :value="number_format($order->amount, 2) . ' ' . config('invoice.currency')" :bold="true" />
    </x-email.summary>

    <x-email.divider />

    <x-email.text muted small>
        This receipt confirms that your payment has been successfully processed. Please retain this email for your records.
    </x-email.text>

    <div style="text-align: center; margin-top: 32px;">
        <x-email.button :href="config('app.url') . '/client/orders/' . $order->uuid" variant="outline">View Order</x-email.button>
    </div>
</x-email.layout>
