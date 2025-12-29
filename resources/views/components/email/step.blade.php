@props(['number', 'title'])

<div style="display: flex; margin-bottom: 16px;">
    <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 14px; flex-shrink: 0; margin-right: 16px;">
        {{ $number }}
    </div>
    <div style="flex: 1;">
        <div style="font-weight: 600; color: #1a1a1a; margin-bottom: 4px;">{{ $title }}</div>
        <div style="color: #64748b; font-size: 14px;">{{ $slot }}</div>
    </div>
</div>
