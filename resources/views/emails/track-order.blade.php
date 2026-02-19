<x-email.layout title="Track Your Orders">
    <x-email.heading>Track Your Orders</x-email.heading>

    <x-email.text>You requested access to your order history. Click the button below to view all your orders and eSIM details.</x-email.text>

    <div style="text-align: center; margin: 32px 0;">
        <x-email.button :href="$url">View My Orders</x-email.button>
    </div>

    <x-email.alert type="info" title="Secure Link">
        This link is valid for 7 days and is unique to your email address. Do not share it with others.
    </x-email.alert>

    <x-email.text muted small center class="mt-4">
        If you didn't request this, you can safely ignore this email.
    </x-email.text>
</x-email.layout>
