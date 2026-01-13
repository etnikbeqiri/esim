@props(['label', 'value', 'bold' => false])

@php
$borderStyle = $bold ? 'border-bottom: none;' : 'border-bottom: 1px solid #aad1b6;';
$fontWeight = $bold ? 'font-weight: 700; font-size: 18px;' : 'font-weight: 500;';
$padding = $bold ? 'padding-top: 16px;' : '';
@endphp

<div style="display: flex; justify-content: space-between; padding: 10px 0; {{ $borderStyle }} {{ $fontWeight }} {{ $padding }}">
    <span style="color: #004528;">{{ $label }}</span>
    <span style="color: #002a18;">{{ $value }}</span>
</div>
