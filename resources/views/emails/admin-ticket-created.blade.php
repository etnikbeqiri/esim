<x-email.layout title="New Support Ticket">
    <x-email.heading>New Support Ticket Received</x-email.heading>

    <x-email.text>A new support ticket has been submitted.</x-email.text>

    <x-email.alert type="info">
        <strong>Reference:</strong> {{ $ticketReference }}<br>
        <strong>From:</strong> {{ $customerName }} ({{ $customerEmail }})<br>
        <strong>Subject:</strong> {{ $ticketSubject }}<br>
        <strong>Priority:</strong> {{ $ticketPriority }}
    </x-email.alert>

    <x-email.heading :level="2">Message</x-email.heading>

    <div style="background-color: #f9fafb; padding: 16px; margin: 16px 0; border-radius: 8px; border: 1px solid #e5e7eb;">
        <p style="margin: 0; color: #374151; font-size: 14px; white-space: pre-wrap;">{{ $ticketMessage }}</p>
    </div>

    <div style="text-align: center; margin-top: 24px; margin-bottom: 24px;">
        <x-email.button :href="$adminTicketUrl">View Ticket</x-email.button>
    </div>
</x-email.layout>
