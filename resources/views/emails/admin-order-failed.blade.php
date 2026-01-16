<x-email.layout title="Order Failed - Action Required">
    <x-email.heading>Order Processing Failure</x-email.heading>

    <x-email.text>An order could not be processed successfully and may require manual intervention to resolve.</x-email.text>

    <x-email.alert type="error" title="Failure Detected">
        <strong>Order #{{ $order->order_number }}</strong> has encountered a processing failure.
        @if($reason ?? false)
            <br><br>Error: {{ $reason }}
        @endif
    </x-email.alert>

    <x-email.heading :level="2">Order Information</x-email.heading>

    <x-email.summary>
        <x-email.summary-row label="Order Number" :value="'#' . $order->order_number" />
        <x-email.summary-row label="Customer Email" :value="$customerEmail ?? 'Guest'" />
        <x-email.summary-row label="Package" :value="$package->name" />
        <x-email.summary-row label="Transaction Value" :value="number_format($order->amount, 2) . ' ' . config('invoice.currency')" />
        <x-email.summary-row label="Error Details" :value="$reason ?? 'Unknown error'" />
        <x-email.summary-row label="Failed At" :value="now()->format('F j, Y \a\t g:i A')" />
    </x-email.summary>

    <x-email.heading :level="2">Troubleshooting Steps</x-email.heading>

    <x-email.step number="1" title="Check Provider Status">
        Verify the upstream provider API is operational and responding to provisioning requests.
    </x-email.step>

    <x-email.step number="2" title="Review Order Logs">
        Examine detailed transaction logs for additional error context and debugging information.
    </x-email.step>

    <x-email.step number="3" title="Customer Communication">
        Determine if proactive customer notification is required based on the failure nature.
    </x-email.step>

    <x-email.step number="4" title="Process Refund">
        If payment was captured, initiate the refund process if the order cannot be fulfilled.
    </x-email.step>

    <div style="text-align: center; margin-top: 32px;">
        <x-email.button :href="config('app.url') . '/admin/orders/' . $order->id">View Order Details</x-email.button>
    </div>
</x-email.layout>
