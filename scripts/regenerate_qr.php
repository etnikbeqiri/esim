<?php

use App\Models\EsimProfile;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Writer;

require __DIR__ . '/../vendor/autoload.php';

$count = 0;
$profiles = EsimProfile::all();
echo "Regenerating QR codes for " . $profiles->count() . " profiles...\n";

foreach ($profiles as $profile) {
    $lpaString = $profile->lpa_string;
    
    if (!$lpaString) {
        echo "Profile {$profile->id}: No LPA string, skipping\n";
        continue;
    }
    
    try {
        $rendererStyle = new RendererStyle(size: 400, margin: 0);
        $renderer = new ImageRenderer($rendererStyle, new SvgImageBackEnd());
        $writer = new Writer($renderer);
        $svg = $writer->writeString($lpaString);
        
        if (!empty($svg)) {
            $profile->update(['qr_code_data' => base64_encode($svg)]);
            $count++;
            echo "Profile {$profile->id}: QR regenerated ✓\n";
        }
    } catch (\Exception $e) {
        echo "Profile {$profile->id}: Failed - {$e->getMessage()}\n";
    }
}

echo "\nDone! Regenerated $count QR codes.\n";
