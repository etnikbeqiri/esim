@props(['label', 'value', 'bold' => false])

@php
$border = $bold ? '' : 'border-bottom: 1px solid #e4e4e7;';
$weight = $bold ? 'font-weight: 600;' : 'font-weight: 500;';
$paddingTop = $bold ? 'padding-top: 8px;' : 'padding-top: 4px;';
$paddingBottom = $bold ? 'padding-bottom: 4px;' : 'padding-bottom: 4px;';
@endphp

<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
        <td style="{{ $paddingTop }} {{ $paddingBottom }} {{ $border }} {{ $weight }} color: #52525b; font-size: 14px; width: 50%;">
            {{ $label }}
        </td>
        <td style="{{ $paddingTop }} {{ $paddingBottom }} {{ $border }} {{ $weight }} color: #18181b; font-size: 14px; text-align: right; width: 50%;">
            {{ $value }}
        </td>
    </tr>
</table>
