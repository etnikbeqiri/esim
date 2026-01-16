<x-email.layout title="Customer Reply on Ticket">
    <x-email.heading>New Customer Reply</x-email.heading>

    <x-email.text>A customer has replied to a support ticket{{ $assignedTo ? ' assigned to you' : '' }}.</x-email.text>

    <x-email.alert type="info">
        <strong>Reference:</strong> {{ $ticketReference }}<br>
        <strong>From:</strong> {{ $customerName }} ({{ $customerEmail }})<br>
        <strong>Subject:</strong> {{ $ticketSubject }}
    </x-email.alert>

    <x-email.heading :level="2">Customer Reply</x-email.heading>

    <div style="background-color: #f9fafb; padding: 16px; margin: 16px 0; border-radius: 8px; border: 1px solid #e5e7eb;">
        <p style="margin: 0; color: #374151; font-size: 14px; white-space: pre-wrap;">{{ $replyMessage }}</p>
    </div>

    <div style="text-align: center; margin-top: 24px; margin-bottom: 24px;">
        <x-email.button :href="$adminTicketUrl">View & Respond</x-email.button>
    </div>
</x-email.layout>
