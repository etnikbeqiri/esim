@props(['label', 'value' => null])

<tr>
    <td style="padding: 12px 16px; text-align: left; border-bottom: 1px solid #e2e8f0; color: #64748b;">{{ $label }}</td>
    <td style="padding: 12px 16px; text-align: left; border-bottom: 1px solid #e2e8f0; color: #1a1a1a;">{{ $value ?? $slot }}</td>
</tr>
