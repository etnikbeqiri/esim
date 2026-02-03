<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class GeoLocationController extends Controller
{
    public function detect(Request $request): JsonResponse
    {
        $ip = $request->ip();

        if ($this->isPrivateIp($ip)) {
            return response()->json([
                'country' => null,
                'country_code' => 'XK',
            ]);
        }

        $cacheKey = "geo_ip_{$ip}";

        $data = Cache::remember($cacheKey, now()->addHours(24), function () use ($ip) {
            try {
                $response = Http::timeout(3)->get("http://ip-api.com/json/{$ip}");

                if ($response->successful()) {
                    $json = $response->json();

                    if (($json['status'] ?? null) === 'success') {
                        return [
                            'country' => $json['country'] ?? null,
                            'country_code' => $json['countryCode'] ?? null,
                        ];
                    }
                }
            } catch (\Exception $e) {
            }

            return [
                'country' => null,
                'country_code' => null,
            ];
        });

        return response()->json($data);
    }

    private function isPrivateIp(string $ip): bool
    {
        return in_array($ip, ['127.0.0.1', '::1']) ||
            filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) === false;
    }
}
