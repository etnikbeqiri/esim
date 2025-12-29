@props(['type' => 'info'])

@php
$styles = match($type) {
    'success' => 'background-color: #d1fae5; border: 1px solid #10b981; color: #065f46;',
    'error' => 'background-color: #fee2e2; border: 1px solid #ef4444; color: #991b1b;',
    'warning' => 'background-color: #fef3c7; border: 1px solid #f59e0b; color: #92400e;',
    default => 'background-color: #dbeafe; border: 1px solid #3b82f6; color: #1e40af;',
};
@endphp

<div style="padding: 16px 20px; border-radius: 8px; margin: 20px 0; {{ $styles }}">
    {{ $slot }}
</div>
