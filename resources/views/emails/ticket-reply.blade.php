<x-email.layout title="New Reply to Your Ticket">
    <x-email.heading>New Reply to Your Support Ticket</x-email.heading>

    <x-email.text>Hello {{ $customerName }},</x-email.text>

    <x-email.text>Our support team has replied to your ticket <strong>{{ $ticketReference }}</strong>.</x-email.text>

    <x-email.alert type="info">
        <strong>Subject:</strong> {{ $ticketSubject }}
    </x-email.alert>

    @if($replyPreview ?? false)
    <div style="background-color: #f9fafb; border-left: 4px solid #3b82f6; padding: 16px; margin: 24px 0; border-radius: 4px;">
        <p style="margin: 0; color: #374151; font-size: 14px; white-space: pre-wrap;">{{ $replyPreview }}</p>
    </div>
    @endif

    <x-email.text>Click the button below to view the full conversation and reply:</x-email.text>

    <div style="text-align: center; margin-top: 24px; margin-bottom: 24px;">
        <x-email.button :href="$ticketUrl">View & Reply</x-email.button>
    </div>

    <x-email.divider />

    <x-email.text style="color: #6b7280; font-size: 14px;">
        Ticket Reference: <strong>{{ $ticketReference }}</strong>
    </x-email.text>
</x-email.layout>
