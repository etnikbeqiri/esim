@props(['title'])

<div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
    <div style="font-weight: 600; color: #1a1a1a; margin-bottom: 8px;">{{ $title }}</div>
    <div style="color: #64748b; font-family: 'Courier New', monospace; word-break: break-all;">{{ $slot }}</div>
</div>
