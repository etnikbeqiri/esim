@props(['label', 'value' => null])

<tr>
    <td style="padding: 14px 16px; text-align: left; border-bottom: 1px solid #d5e8da; color: #475569; font-size: 14px;">{{ $label }}</td>
    <td style="padding: 14px 16px; text-align: left; border-bottom: 1px solid #d5e8da; color: #002a18; font-weight: 500;">{{ $value ?? $slot }}</td>
</tr>
