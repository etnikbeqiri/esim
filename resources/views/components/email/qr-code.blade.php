@props(['data', 'caption' => 'Scan this QR code with your phone\'s camera'])

<div style="text-align: center; padding: 24px; background-color: #ffffff; border: 2px dashed #e2e8f0; border-radius: 12px; margin: 24px 0;">
    <p style="color: #64748b; font-size: 14px; margin-bottom: 16px;">{{ $caption }}</p>
    <img src="data:image/png;base64,{{ $data }}" alt="QR Code" style="max-width: 200px; height: auto;">
</div>
