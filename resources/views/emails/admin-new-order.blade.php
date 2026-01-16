<x-email.layout title="New Order Received">
    <x-email.heading>New Order Received</x-email.heading>

    <x-email.text>A new order has been placed on {{ config('app.name') }} and is queued for processing.</x-email.text>

    <x-email.alert type="info" title="Order Reference">
        <strong>Order #{{ $order->order_number }}</strong>
    </x-email.alert>

    <x-email.heading :level="2">Order Details</x-email.heading>

    <x-email.summary>
        <x-email.summary-row label="Order Number" :value="'#' . $order->order_number" />
        <x-email.summary-row label="Customer Email" :value="$customerEmail ?? 'Guest'" />
        <x-email.summary-row label="Customer Type" :value="ucfirst($customerType ?? 'B2C')" />
        <x-email.summary-row label="Package" :value="$package->name" />
        <x-email.summary-row label="Data" :value="$package->data_label" />
        <x-email.summary-row label="Validity" :value="$package->validity_label" />
        @if($order->country)
            <x-email.summary-row label="Country" :value="$order->country->name" />
        @endif
        <x-email.summary-row label="Amount" :value="number_format($order->amount, 2) . ' ' . config('invoice.currency')" :bold="true" />
        <x-email.summary-row label="Order Date" :value="$order->created_at->format('F j, Y \a\t g:i A')" />
        <x-email.summary-row label="Status" :value="ucfirst($order->status->value)" />
    </x-email.summary>

    <div style="text-align: center; margin-top: 32px;">
        <x-email.button :href="config('app.url') . '/admin/orders/' . $order->id">View Order</x-email.button>
    </div>
</x-email.layout>
