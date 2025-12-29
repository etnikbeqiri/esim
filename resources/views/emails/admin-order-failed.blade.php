<x-email.layout title="Order Failed - Attention Required">
    <x-email.heading>Order Failed ⚠️</x-email.heading>

    <x-email.text>An order has failed and may require your attention.</x-email.text>

    <x-email.alert type="error">
        <strong>Order #{{ $order->order_number }} has failed.</strong>
        @if($reason ?? false)
            <br>Reason: {{ $reason }}
        @endif
    </x-email.alert>

    <x-email.heading :level="2">Order Details</x-email.heading>

    <x-email.table>
        <x-email.table-row label="Order Number" :value="'#' . $order->order_number" />
        <x-email.table-row label="Customer Email" :value="$customerEmail ?? 'Guest'" />
        <x-email.table-row label="Package" :value="$package->name" />
        <x-email.table-row label="Amount" :value="$currency . number_format($order->amount, 2)" />
        <x-email.table-row label="Failure Reason" :value="$reason ?? 'Unknown'" />
        <x-email.table-row label="Failed At" :value="now()->format('F j, Y \a\t g:i A')" />
    </x-email.table>

    <x-email.heading :level="2">Recommended Actions</x-email.heading>

    <ul>
        <li>Check the provider API status</li>
        <li>Review the order logs for more details</li>
        <li>Contact the customer if necessary</li>
        <li>Process a refund if applicable</li>
    </ul>

    <div style="text-align: center; margin-top: 24px;">
        <x-email.button :href="config('app.url') . '/admin/orders/' . $order->id">View Order Details</x-email.button>
    </div>
</x-email.layout>
