<x-email.layout title="Payment Failed Alert">
    <x-email.heading>Payment Processing Failure</x-email.heading>

    <x-email.text>A payment transaction has failed on {{ config('app.name') }}. The customer has been notified, but monitoring may be required.</x-email.text>

    <x-email.alert type="error" title="Transaction Failed">
        <strong>Payment for Order #{{ $order->order_number }}</strong> could not be processed successfully.
    </x-email.alert>

    <x-email.heading :level="2">Transaction Details</x-email.heading>

    <x-email.summary>
        <x-email.summary-row label="Order Number" :value="'#' . $order->order_number" />
        <x-email.summary-row label="Customer Email" :value="$customerEmail ?? 'Guest'" />
        <x-email.summary-row label="Amount" :value="number_format($order->amount, 2) . ' ' . config('invoice.currency')" />
        @if($errorCode ?? false)
            <x-email.summary-row label="Error Code" :value="$errorCode" />
        @endif
        @if($errorMessage ?? false)
            <x-email.summary-row label="Error Message" :value="$errorMessage" />
        @endif
        <x-email.summary-row label="Failed At" :value="now()->format('F j, Y \a\t g:i A')" />
    </x-email.summary>

    <x-email.text muted>
        <strong>Customer Notification:</strong> The affected customer has been automatically notified of the payment failure. Standard protocol suggests no immediate administrative action is required unless the issue recurs or escalates.
    </x-email.text>

    <x-email.heading :level="2">Monitoring Recommendations</x-email.heading>

    <x-email.step number="1" title="Watch for Recurring Failures">
        Monitor if multiple orders from this customer or payment method experience similar issues.
    </x-email.step>

    <x-email.step number="2" title="Payment Gateway Status">
        Verify the payment processor/gateway is operating normally without service disruptions.
    </x-email.step>

    <x-email.step number="3" title="Fraud Patterns">
        Review the transaction for any indicators that may suggest fraudulent activity.
    </x-email.step>

    <div style="text-align: center; margin-top: 32px;">
        <x-email.button :href="config('app.url') . '/admin/orders/' . $order->id">View Order</x-email.button>
    </div>
</x-email.layout>
