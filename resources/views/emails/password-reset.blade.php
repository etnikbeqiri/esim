<x-email.layout title="Reset Your Password">
    <x-email.heading>Reset Your Password 🔐</x-email.heading>

    <x-email.text>Hello {{ $customerName ?? 'there' }},</x-email.text>

    <x-email.text>We received a request to reset your password. Click the button below to create a new password.</x-email.text>

    <div style="text-align: center; margin: 32px 0;">
        <x-email.button :href="config('app.url') . '/reset-password/' . ($token ?? 'demo-token')">Reset Password</x-email.button>
    </div>

    <x-email.alert type="warning">
        <strong>Important:</strong> This password reset link will expire in {{ $expires ?? '60' }} minutes. If you didn't request this, please ignore this email.
    </x-email.alert>

    <x-email.text muted small center class="mt-4">
        If the button above doesn't work, you can copy and paste this link into your browser:<br>
        <a href="{{ config('app.url') }}/reset-password/{{ $token ?? 'demo-token' }}" style="word-break: break-all;">
            {{ config('app.url') }}/reset-password/{{ $token ?? 'demo-token' }}
        </a>
    </x-email.text>

    <x-email.text muted small center>
        Need help? Contact us at <a href="mailto:{{ config('contact.support_email') }}">{{ config('contact.support_email') }}</a>
    </x-email.text>
</x-email.layout>
