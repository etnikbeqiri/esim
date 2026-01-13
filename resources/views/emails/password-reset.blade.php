<x-email.layout title="Reset Password">
    <x-email.heading>Reset Your Password</x-email.heading>

    <x-email.text>Hello {{ $customerName ?? 'there' }},</x-email.text>

    <x-email.text>We received a request to reset the password for your {{ config('app.name') }} account. Click the button below to create a new secure password.</x-email.text>

    <div style="text-align: center; margin: 32px 0;">
        <x-email.button :href="config('app.url') . '/reset-password/' . ($token ?? 'demo-token')">Reset Password</x-email.button>
    </div>

    <x-email.alert type="warning" title="Security Notice">
        This link expires in {{ $expires ?? '60' }} minutes. If you didn't request a reset, you can safely ignore this email.
    </x-email.alert>

    <x-email.text muted small center class="mt-4">
        Or paste this link into your browser:<br>
        <a href="{{ config('app.url') }}/reset-password/{{ $token ?? 'demo-token' }}" style="word-break: break-all; color: #71717a; text-decoration: underline;">
            {{ config('app.url') }}/reset-password/{{ $token ?? 'demo-token' }}
        </a>
    </x-email.text>
</x-email.layout>
