<x-email.layout title="Ticket Created">
    <x-email.heading>Support Ticket Created</x-email.heading>

    <x-email.text>Hello {{ $customerName }},</x-email.text>

    <x-email.text>Thank you for contacting us. We have received your support request and our team will review it shortly.</x-email.text>

    <x-email.alert type="info">
        <strong>Ticket Reference:</strong> {{ $ticketReference }}<br>
        <strong>Subject:</strong> {{ $ticketSubject }}
    </x-email.alert>

    <x-email.text>You can view and track your ticket status using the link below:</x-email.text>

    <div style="text-align: center; margin-top: 24px; margin-bottom: 24px;">
        <x-email.button :href="$ticketUrl">View Your Ticket</x-email.button>
    </div>

    <x-email.divider />

    <x-email.text style="color: #6b7280; font-size: 14px;">
        Please keep your ticket reference <strong>{{ $ticketReference }}</strong> for future correspondence. Our support team typically responds within 24 hours.
    </x-email.text>
</x-email.layout>
