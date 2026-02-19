<?php

namespace App\Http\Controllers;

use App\Models\Order;
use BaconQrCode\Common\ErrorCorrectionLevel;
use BaconQrCode\Encoder\Encoder;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class EsimQrCodeController extends Controller
{
    public function __invoke(Request $request, Order $order): Response
    {
        if (! $request->hasValidSignature()) {
            abort(403, 'Invalid or expired link');
        }

        $esimProfile = $order->esimProfile;

        if (! $esimProfile || ! $esimProfile->lpa_string) {
            abort(404);
        }

        $png = $this->generatePng($esimProfile->lpa_string);

        return response($png, 200, [
            'Content-Type' => 'image/png',
            'Cache-Control' => 'public, max-age=31536000, immutable',
        ]);
    }

    private function generatePng(string $data): string
    {
        $qrCode = Encoder::encode($data, ErrorCorrectionLevel::M(), 'UTF-8');
        $matrix = $qrCode->getMatrix();
        $matrixWidth = $matrix->getWidth();
        $matrixHeight = $matrix->getHeight();

        $imgSize = 400;
        $scale = (int) floor($imgSize / $matrixWidth);
        $actualSize = $scale * $matrixWidth;

        $img = imagecreatetruecolor($actualSize, $actualSize);
        $white = imagecolorallocate($img, 255, 255, 255);
        $black = imagecolorallocate($img, 0, 0, 0);
        imagefill($img, 0, 0, $white);

        for ($y = 0; $y < $matrixHeight; $y++) {
            for ($x = 0; $x < $matrixWidth; $x++) {
                if ($matrix->get($x, $y) === 1) {
                    imagefilledrectangle(
                        $img,
                        $x * $scale,
                        $y * $scale,
                        ($x + 1) * $scale - 1,
                        ($y + 1) * $scale - 1,
                        $black,
                    );
                }
            }
        }

        ob_start();
        imagepng($img, null, 9);
        $png = ob_get_clean();

        return $png;
    }
}
