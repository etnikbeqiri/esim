@props(['label', 'value', 'bold' => false])

@php
$borderWidth = '1px';
$borderColor = '#e4e4e7';
$padding = '12px 16px';
$fontWeightLabel = '500';
$fontWeightValue = $bold ? '600' : '400';
$colorLabel = '#71717a';
$colorValue = '#09090b';
@endphp

<tr>
    <td style="padding: {{ $padding }}; border-bottom: {{ $borderWidth }} solid {{ $borderColor }}; font-weight: {{ $fontWeightLabel }}; color: {{ $colorLabel }}; font-size: 14px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; width: 40%; vertical-align: top;">
        {{ $label }}
    </td>
    <td style="padding: {{ $padding }}; border-bottom: {{ $borderWidth }} solid {{ $borderColor }}; font-weight: {{ $fontWeightValue }}; color: {{ $colorValue }}; font-size: 14px; text-align: right; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; width: 60%; vertical-align: top;">
        {{ $value }}
    </td>
</tr>
