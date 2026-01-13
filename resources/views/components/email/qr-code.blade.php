@props(['data', 'caption' => 'Scan this QR code with your phone\'s camera'])

<div style="text-align: center; padding: 32px 24px; background: linear-gradient(135deg, #f8fafc 0%, #eef5f0 50%, #f0fdf4 100%); border-radius: 20px; margin: 28px 0; position: relative; overflow: hidden;">
    <!-- Decorative corner accents -->
    <div style="position: absolute; top: 12px; left: 12px; width: 24px; height: 24px; border-top: 3px solid #fde047; border-left: 3px solid #fde047; border-radius: 4px 0 0 0;"></div>
    <div style="position: absolute; top: 12px; right: 12px; width: 24px; height: 24px; border-top: 3px solid #fde047; border-right: 3px solid #fde047; border-radius: 0 4px 0 0;"></div>
    <div style="position: absolute; bottom: 12px; left: 12px; width: 24px; height: 24px; border-bottom: 3px solid #fde047; border-left: 3px solid #fde047; border-radius: 0 0 0 4px;"></div>
    <div style="position: absolute; bottom: 12px; right: 12px; width: 24px; height: 24px; border-bottom: 3px solid #fde047; border-right: 3px solid #fde047; border-radius: 0 0 4px 0;"></div>

    <!-- Caption -->
    <p style="color: #003720; font-size: 15px; margin-bottom: 20px; font-weight: 600; position: relative; z-index: 1;">
        ✨ {{ $caption }} ✨
    </p>

    <!-- QR Code Container with premium styling -->
    <div style="display: inline-block; position: relative; z-index: 1;">
        <!-- Outer ring -->
        <div style="position: absolute; inset: -6px; background: linear-gradient(135deg, #fde047 0%, #fbbf24 50%, #fde047 100%); border-radius: 20px;"></div>

        <!-- White background for QR -->
        <div style="background: #ffffff; padding: 16px; border-radius: 16px; box-shadow: 0 12px 32px rgba(0, 96, 57, 0.15), 0 0 0 1px rgba(254, 224, 71, 0.3); position: relative;">
            <img src="data:image/png;base64,{{ $data }}" alt="QR Code" style="width: 180px; height: 180px; display: block;">
        </div>
    </div>

    <!-- Helper text -->
    <p style="color: #64748b; font-size: 13px; margin-top: 16px; position: relative; z-index: 1;">
        Works with iPhone & Android
    </p>
</div>
