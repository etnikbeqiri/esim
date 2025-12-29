@props(['label', 'value', 'bold' => false])

<div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; {{ $bold ? 'font-weight: 600; font-size: 18px; padding-top: 16px; border-bottom: none;' : '' }}">
    <span>{{ $label }}</span>
    <span>{{ $value }}</span>
</div>
