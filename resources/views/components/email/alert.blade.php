@props(['type' => 'info'])

@php
$styles = match($type) {
    'success' => 'background: linear-gradient(135deg, #d5e8da 0%, #eef5f0 100%); border: 1px solid #7ab68d; color: #003720;',
    'error' => 'background: linear-gradient(135deg, #fde8e8 0%, #ffffff 100%); border: 1px solid #dc2626; color: #991b1b;',
    'warning' => 'background: linear-gradient(135deg, #fef9c3 0%, #fefce8 100%); border: 1px solid #daa520; color: #8b6914;',
    default => 'background: linear-gradient(135deg, #eef5f0 0%, #f0f9f4 100%); border: 1px solid #7ab68d; color: #003720;',
};
@endphp

<div style="padding: 18px 22px; border-radius: 12px; margin: 20px 0; {{ $styles }}">
    {{ $slot }}
</div>
