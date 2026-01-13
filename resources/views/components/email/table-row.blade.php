@props(['label', 'value' => null])

<tr>
    <td style="padding: 10px 14px; border: 1px solid #e4e4e7; border-top: none; color: #52525b; font-size: 14px; mso-line-height-rule: exactly;">
        {{ $label }}
    </td>
    <td style="padding: 10px 14px; border: 1px solid #e4e4e7; border-top: none; border-left: none; color: #18181b; font-weight: 500; font-size: 14px; text-align: right; mso-line-height-rule: exactly;">
        {{ $value ?? $slot }}
    </td>
</tr>
