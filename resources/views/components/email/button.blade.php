@props(['href' => '#', 'variant' => 'primary'])

@php
$styles = match($variant) {
    'secondary' => 'background: #f4f4f5; color: #1a1a1a !important;',
    default => 'background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff !important;',
};
@endphp

<a href="{{ $href }}" style="display: inline-block; padding: 14px 32px; font-size: 16px; font-weight: 600; {{ $styles }} border-radius: 8px; text-decoration: none !important; margin: 8px 4px; text-align: center;">
    {{ $slot }}
</a>
