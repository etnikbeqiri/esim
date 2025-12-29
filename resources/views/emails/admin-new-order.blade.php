<x-email.layout title="New Order Received">
    <x-email.heading>New Order Received 🛒</x-email.heading>

    <x-email.text>A new order has been placed on {{ config('app.name') }}.</x-email.text>

    <x-email.alert type="info">
        <strong>Order #{{ $order->order_number }}</strong>
    </x-email.alert>

    <x-email.heading :level="2">Order Details</x-email.heading>

    <x-email.table>
        <x-email.table-row label="Order Number" :value="'#' . $order->order_number" />
        <x-email.table-row label="Customer Email" :value="$customerEmail ?? 'Guest'" />
        <x-email.table-row label="Customer Type" :value="ucfirst($customerType ?? 'B2C')" />
        <x-email.table-row label="Package" :value="$package->name" />
        <x-email.table-row label="Data" :value="$package->data_label" />
        <x-email.table-row label="Validity" :value="$package->validity_label" />
        @if($order->country)
            <x-email.table-row label="Country" :value="$order->country->name" />
        @endif
        <x-email.table-row label="Amount">
            <strong>{{ $currency }}{{ number_format($order->amount, 2) }}</strong>
        </x-email.table-row>
        <x-email.table-row label="Order Date" :value="$order->created_at->format('F j, Y \a\t g:i A')" />
        <x-email.table-row label="Status" :value="ucfirst($order->status->value)" />
    </x-email.table>

    <div style="text-align: center; margin-top: 24px;">
        <x-email.button :href="config('app.url') . '/admin/orders/' . $order->id">View Order</x-email.button>
    </div>
</x-email.layout>
