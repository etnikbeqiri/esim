<?php

namespace App\Services\Providers;

use App\DTOs\EsimProfileData;
use App\DTOs\PackageData;
use App\DTOs\PurchaseResult;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class SmsPoolProvider extends BaseProvider
{
    protected function getHeaders(): array
    {
        return [
            'Content-Type' => 'application/x-www-form-urlencoded',
            'Accept' => 'application/json',
            'Origin' => 'https://www.smspool.net',
        ];
    }

    public function fetchCountries(): Collection
    {
        $response = $this->makePostRequest('/country/retrieve_all', [
            'key' => $this->apiKey,
        ]);

        if (!is_array($response)) {
            return collect();
        }

        return collect($response)->map(function ($country) {
            return [
                'id' => $country['ID'] ?? null,
                'name' => $country['name'] ?? '',
                'iso_code' => strtoupper($country['short_name'] ?? ''),
                'region' => $country['region'] ?? null,
            ];
        })->filter(fn ($c) => !empty($c['iso_code']));
    }

    public function fetchPackages(int $page = 1, int $perPage = 100): Collection
    {
        // This method now fetches ALL packages by iterating through countries
        // For paginated access, use fetchPackagesByCountry
        return collect();
    }

    public function fetchPackagesByCountry(string $countryCode): Collection
    {
        $response = $this->makePostRequest('/esim/plans', [
            'key' => $this->apiKey,
            'country' => $countryCode,
        ]);

        // Handle error responses (e.g., country has no eSIM plans)
        if (!is_array($response) || isset($response['success']) && $response['success'] === 0) {
            return collect();
        }

        return collect($response)
            ->filter(fn ($item) => is_array($item) && isset($item['ID']))
            ->map(function ($item) use ($countryCode) {
                return $this->transformPackage($item, $countryCode);
            });
    }

    public function getPackageCount(): int
    {
        // Count is determined by fetching all countries and their packages
        return 0;
    }

    public function purchaseEsim(string $packageId): PurchaseResult
    {
        $endpoint = '/esim/purchase';
        $url = $this->baseUrl . $endpoint;
        
        try {
            $this->applyRateLimit();

            Log::info('SMSPool API request', [
                'method' => 'POST',
                'url' => $url,
                'endpoint' => $endpoint,
                'params' => ['plan' => $packageId, 'key' => substr($this->apiKey, 0, 10) . '...'],
            ]);

            $response = $this->http()
                ->withHeaders($this->getHeaders())
                ->asForm()
                ->post($endpoint, [
                    'key' => $this->apiKey,
                    'plan' => $packageId,
                ]);

            $body = $response->body();
            $data = $response->json() ?? [];
            $httpStatus = $response->status();

            if (($data['success'] ?? 0) === 1) {
                $transactionId = $data['transactionId'] ?? null;

                if (!$transactionId) {
                    Log::error('SMSPool purchase: No transaction ID', [
                        'url' => $url,
                        'response' => $data,
                    ]);
                    return PurchaseResult::failure(
                        errorMessage: 'No transaction ID returned from purchase',
                        isRetryable: false,
                    );
                }

                Log::info('SMSPool purchase successful', [
                    'url' => $url,
                    'package_id' => $packageId,
                    'transaction_id' => $transactionId,
                    'http_status' => $httpStatus,
                ]);

                return PurchaseResult::success(
                    providerOrderId: $transactionId,
                    iccid: $transactionId,
                    activationCode: '',
                    smdpAddress: null,
                    qrCodeData: null,
                    lpaString: null,
                    pin: null,
                    puk: null,
                    apn: null,
                    dataTotalBytes: 0,
                    providerData: $data,
                );
            }

            $providerMessage = $data['message'] ?? $data['error'] ?? 'Purchase failed';
            $errorMessage = "SMSPool purchase failed (HTTP {$httpStatus}): {$providerMessage}";

            Log::error('SMSPool purchase rejected', [
                'url' => $url,
                'package_id' => $packageId,
                'http_status' => $httpStatus,
                'message' => $providerMessage,
                'response_body' => $body,
                'response_json' => $data,
            ]);

            return PurchaseResult::failure(
                errorMessage: $errorMessage,
                isRetryable: $this->isRetryableError($providerMessage),
            );
        } catch (\Exception $e) {
            Log::error('SMSPool purchase error', [
                'url' => $url,
                'package_id' => $packageId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return PurchaseResult::failure(
                errorMessage: $e->getMessage(),
                isRetryable: $this->isRetryableError($e->getMessage()),
            );
        }
    }

    public function getEsimProfile(string $providerOrderId): EsimProfileData
    {
        $response = $this->makePostRequest('/esim/profile', [
            'key' => $this->apiKey,
            'transactionId' => $providerOrderId,
        ]);

        $isActivated = ($response['activated'] ?? 0) === 1;

        return new EsimProfileData(
            iccid: $response['iccid'] ?? $providerOrderId,
            status: $isActivated ? 'activated' : 'active',
            dataUsedBytes: $this->parseDataBytes($response['remainingData'] ?? null, $response['totalData'] ?? null, true),
            dataTotalBytes: $this->parseDataBytes($response['totalData'] ?? null),
            activatedAt: null,
            expiresAt: null,
            isActivated: $isActivated,
            topupAvailable: ($response['topup'] ?? 0) === 1,
            metadata: $response,
        );
    }

    public function fetchEsimProfileRaw(string $providerOrderId): array
    {
        $this->applyRateLimit();

        $response = $this->http()
            ->withHeaders($this->getHeaders())
            ->asForm()
            ->post('/esim/profile', [
                'key' => $this->apiKey,
                'transactionId' => $providerOrderId,
            ]);

        if (!$response->successful()) {
            return [
                'success' => false,
                'status' => $response->status(),
                'message' => $response->json('message') ?? 'Profile fetch failed',
                'body' => $response->body(),
            ];
        }

        $data = $response->json() ?? [];
        $data['success'] = true;

        return $data;
    }

    public function updateEsimLabel(string $transactionId, ?string $label): array
    {
        if (empty($label)) {
            return ['success' => false, 'error' => 'No label provided'];
        }

        $endpoint = '/esim/label/update';
        $url = $this->baseUrl . $endpoint;

        try {
            $this->applyRateLimit();

            Log::info('SMSPool: Updating eSIM label', [
                'url' => $url,
                'transaction_id' => $transactionId,
                'label' => $label,
            ]);

            $response = $this->http()
                ->withHeaders($this->getHeaders())
                ->asForm()
                ->post($endpoint, [
                    'key' => $this->apiKey,
                    'transactionId' => $transactionId,
                    'label' => $label,
                ]);

            $responseBody = $response->body();
            $responseData = $response->json() ?? [];
            
            if ($response->successful() && ($responseData['success'] ?? 0) === 1) {
                Log::info('SMSPool: eSIM label updated', [
                    'transaction_id' => $transactionId,
                    'label' => $label,
                    'http_status' => $response->status(),
                    'response' => $responseBody,
                ]);
                return ['success' => true, 'data' => $responseData];
            } else {
                Log::warning('SMSPool: Failed to update eSIM label', [
                    'transaction_id' => $transactionId,
                    'label' => $label,
                    'status' => $response->status(),
                    'body' => $responseBody,
                ]);
                return [
                    'success' => false,
                    'error' => $responseData['message'] ?? 'Label update failed',
                    'http_status' => $response->status(),
                ];
            }
        } catch (\Exception $e) {
            Log::warning('SMSPool: Exception updating eSIM label', [
                'transaction_id' => $transactionId,
                'label' => $label,
                'error' => $e->getMessage(),
            ]);
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    public function checkStock(string $packageId): bool
    {
        try {
            $response = $this->makePostRequest('/esim/pricing', [
                'key' => $this->apiKey,
                'start' => 1,
                'length' => 1000,
            ]);

            $packages = $response['data'] ?? [];

            foreach ($packages as $package) {
                if ((string) ($package['ID'] ?? '') === $packageId) {
                    return true;
                }
            }

            return false;
        } catch (\Exception $e) {
            Log::error('SMSPool stock check error', [
                'package_id' => $packageId,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    public function testConnection(): bool
    {
        try {
            $response = $this->makePostRequest('/country/retrieve_all', [
                'key' => $this->apiKey,
            ]);

            return is_array($response) && count($response) > 0;
        } catch (\Exception $e) {
            Log::error('SMSPool connection test failed', [
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    protected function transformPackage(array $item, string $countryCode = ''): PackageData
    {
        $networkInfo = $this->parseNetworkInfo($item['network'] ?? '');
        $dataMb = $this->parseDataMb($item['dataInGb'] ?? 0);
        $costPrice = (float) ($item['price'] ?? 0);
        $validityDays = (int) ($item['duration'] ?? 30);

        // Determine coverage type based on network info
        $coverageType = 'local';
        $coverageCountries = [];
        if (is_array($networkInfo) && count($networkInfo) > 1) {
            $coverageType = 'regional';
            $coverageCountries = array_column($networkInfo, 'country');
        }

        // Determine network type from speed field
        $speed = $item['speed'] ?? '4G/LTE';
        $networkType = str_contains($speed, '5G') ? '5G' : (str_contains($speed, '4G') ? '4G/LTE' : '3G');
        $supportedNetworks = $this->extractNetworkOperators($networkInfo);

        return new PackageData(
            providerPackageId: (string) ($item['ID'] ?? ''),
            name: $this->generatePackageName($item, $countryCode),
            description: $this->generateDescription($item, $networkInfo),
            countryIso: $countryCode,
            dataMb: $dataMb,
            validityDays: $validityDays,
            sourceCostPrice: $costPrice,
            sourceCurrency: 'USD',
            networkType: $networkType,
            supportedNetworks: $supportedNetworks,
            coverageType: $coverageType,
            coverageCountries: $coverageCountries,
            smsIncluded: false,
            voiceIncluded: false,
            hotspotAllowed: true,
            inStock: true,
            metadata: $item,
        );
    }

    protected function parseNetworkInfo(string $networkJson): array
    {
        if (empty($networkJson)) {
            return [];
        }

        try {
            $decoded = json_decode($networkJson, true);
            return is_array($decoded) ? $decoded : [];
        } catch (\Exception $e) {
            return [];
        }
    }

    protected function parseDataMb(mixed $dataInGb): int
    {
        $gb = (float) $dataInGb;
        return (int) round($gb * 1024);
    }

    protected function parseDataBytes(?string $dataString, ?string $totalData = null, bool $calculateUsed = false): int
    {
        if ($dataString === null) {
            return 0;
        }

        // Parse strings like "1.5 GB" or "500 MB"
        if (preg_match('/^([\d.]+)\s*(GB|MB|KB|B)?$/i', trim($dataString), $matches)) {
            $value = (float) $matches[1];
            $unit = strtoupper($matches[2] ?? 'MB');

            $bytes = match ($unit) {
                'GB' => $value * 1024 * 1024 * 1024,
                'MB' => $value * 1024 * 1024,
                'KB' => $value * 1024,
                default => $value,
            };

            if ($calculateUsed && $totalData) {
                $totalBytes = $this->parseDataBytes($totalData);
                return max(0, $totalBytes - (int) $bytes);
            }

            return (int) $bytes;
        }

        return 0;
    }

    protected function determineNetworkType(array $networkInfo): string
    {
        $types = [];

        foreach ($networkInfo as $network) {
            $speed = strtoupper($network['speed'] ?? $network['type'] ?? '');
            if (str_contains($speed, '5G')) {
                $types[] = '5G';
            } elseif (str_contains($speed, '4G') || str_contains($speed, 'LTE')) {
                $types[] = '4G';
            } elseif (str_contains($speed, '3G')) {
                $types[] = '3G';
            }
        }

        if (in_array('5G', $types)) {
            return '5G';
        }
        if (in_array('4G', $types)) {
            return '4G/LTE';
        }
        if (in_array('3G', $types)) {
            return '3G';
        }

        return '4G/LTE'; // Default
    }

    protected function extractNetworkOperators(array $networkInfo): array
    {
        $result = [];

        // Country name to ISO code mapping
        $countryToIso = [
            'Austria' => 'AT', 'Belgium' => 'BE', 'Bulgaria' => 'BG', 'Croatia' => 'HR', 'Cyprus' => 'CY',
            'Czech Republic' => 'CZ', 'Denmark' => 'DK', 'Estonia' => 'EE', 'Finland' => 'FI', 'France' => 'FR',
            'Germany' => 'DE', 'Greece' => 'GR', 'Hungary' => 'HU', 'Iceland' => 'IS', 'Ireland' => 'IE',
            'Italy' => 'IT', 'Latvia' => 'LV', 'Liechtenstein' => 'LI', 'Lithuania' => 'LT', 'Luxembourg' => 'LU',
            'Malta' => 'MT', 'Netherlands' => 'NL', 'Norway' => 'NO', 'Poland' => 'PL', 'Portugal' => 'PT',
            'Romania' => 'RO', 'Slovakia' => 'SK', 'Slovenia' => 'SI', 'Spain' => 'ES', 'Sweden' => 'SE',
            'Switzerland' => 'CH', 'Turkey' => 'TR', 'Ukraine' => 'UA', 'United Kingdom' => 'GB',
            'United States' => 'US', 'Canada' => 'CA', 'Australia' => 'AU', 'New Zealand' => 'NZ',
            'Japan' => 'JP', 'South Korea' => 'KR', 'China' => 'CN', 'Singapore' => 'SG', 'Thailand' => 'TH',
            'Vietnam' => 'VN', 'Malaysia' => 'MY', 'Indonesia' => 'ID', 'Philippines' => 'PH', 'India' => 'IN',
            'Brazil' => 'BR', 'Mexico' => 'MX', 'Argentina' => 'AR', 'Chile' => 'CL', 'Colombia' => 'CO',
            'Peru' => 'PE', 'Ecuador' => 'EC', 'Venezuela' => 'VE', 'Uruguay' => 'UY', 'Paraguay' => 'PY',
            'Bolivia' => 'BO', 'Costa Rica' => 'CR', 'Panama' => 'PA', 'Guatemala' => 'GT', 'Honduras' => 'HN',
            'El Salvador' => 'SV', 'Nicaragua' => 'NI', 'Dominican Republic' => 'DO', 'Puerto Rico' => 'PR',
            'Jamaica' => 'JM', 'Trinidad and Tobago' => 'TT', 'Bahamas' => 'BS', 'Barbados' => 'BB',
            'South Africa' => 'ZA', 'Egypt' => 'EG', 'Morocco' => 'MA', 'Tunisia' => 'TN', 'Algeria' => 'DZ',
            'Nigeria' => 'NG', 'Kenya' => 'KE', 'Ghana' => 'GH', 'Tanzania' => 'TZ', 'Uganda' => 'UG',
            'Ethiopia' => 'ET', 'Senegal' => 'SN', 'Ivory Coast' => 'CI', 'Cameroon' => 'CM',
            'Israel' => 'IL', 'UAE' => 'AE', 'United Arab Emirates' => 'AE', 'Saudi Arabia' => 'SA',
            'Qatar' => 'QA', 'Kuwait' => 'KW', 'Bahrain' => 'BH', 'Oman' => 'OM', 'Jordan' => 'JO',
            'Lebanon' => 'LB', 'Iraq' => 'IQ', 'Iran' => 'IR', 'Pakistan' => 'PK', 'Bangladesh' => 'BD',
            'Sri Lanka' => 'LK', 'Nepal' => 'NP', 'Myanmar' => 'MM', 'Cambodia' => 'KH', 'Laos' => 'LA',
            'Hong Kong' => 'HK', 'Taiwan' => 'TW', 'Macau' => 'MO', 'Mongolia' => 'MN',
            'Russia' => 'RU', 'Belarus' => 'BY', 'Moldova' => 'MD', 'Georgia' => 'GE', 'Armenia' => 'AM',
            'Azerbaijan' => 'AZ', 'Kazakhstan' => 'KZ', 'Uzbekistan' => 'UZ', 'Turkmenistan' => 'TM',
            'Kyrgyzstan' => 'KG', 'Tajikistan' => 'TJ', 'Serbia' => 'RS', 'Montenegro' => 'ME',
            'Bosnia and Herzegovina' => 'BA', 'North Macedonia' => 'MK', 'Albania' => 'AL', 'Kosovo' => 'XK',
            'Fiji' => 'FJ', 'Papua New Guinea' => 'PG', 'Guam' => 'GU', 'Samoa' => 'WS',
        ];

        foreach ($networkInfo as $countryNetwork) {
            $countryName = $countryNetwork['country'] ?? null;
            $networks = $countryNetwork['network'] ?? [];

            // If no country key, it's a flat structure
            if ($countryName === null) {
                $networks = [$countryNetwork];
                $countryName = null;
            }

            $operators = [];
            foreach ($networks as $network) {
                $name = $network['operatorName'] ?? $network['operator'] ?? $network['name'] ?? null;
                if (empty($name)) {
                    continue;
                }

                $typeField = $network['networkType'] ?? $network['speed'] ?? $network['type'] ?? '4G';
                $type = '4G';
                if (str_contains(strtoupper($typeField), '5G')) {
                    $type = '5G';
                } elseif (str_contains(strtoupper($typeField), '3G')) {
                    $type = '3G';
                }

                $operators[] = [
                    'name' => $name,
                    'type' => $type,
                ];
            }

            if (!empty($operators)) {
                if ($countryName) {
                    $result[] = [
                        'country' => $countryName,
                        'iso_code' => $countryToIso[$countryName] ?? null,
                        'operators' => $operators,
                    ];
                } else {
                    // Flat structure - just add operators directly
                    $result = array_merge($result, $operators);
                }
            }
        }

        return $result;
    }

    protected function generatePackageName(array $item, string $countryCode = ''): string
    {
        $dataGb = (float) ($item['dataInGb'] ?? 0);
        $duration = (int) ($item['duration'] ?? 30);

        $dataLabel = $dataGb >= 1
            ? ($dataGb == intval($dataGb) ? intval($dataGb) . ' GB' : $dataGb . ' GB')
            : round($dataGb * 1024) . ' MB';

        return "{$countryCode} {$dataLabel} / {$duration} Days";
    }

    protected function generateDescription(array $item, array $networkInfo): string
    {
        $dataGb = (float) ($item['dataInGb'] ?? 0);
        $speed = $item['speed'] ?? '4G/LTE';
        $duration = (int) ($item['duration'] ?? 30);
        $extendable = ($item['extendable'] ?? 0) >= 1 ? 'Yes' : 'No';

        $networks = $this->extractNetworkOperators($networkInfo);
        $operatorNames = [];

        // Handle both grouped (regional) and flat (single country) structures
        foreach (array_slice($networks, 0, 3) as $item) {
            if (isset($item['country'])) {
                // Regional: get first operator from each country
                $firstOp = $item['operators'][0]['name'] ?? null;
                if ($firstOp) {
                    $operatorNames[] = $item['country'];
                }
            } else {
                // Single country: just get the name
                $operatorNames[] = $item['name'] ?? '';
            }
        }

        $operatorText = !empty($operatorNames) ? implode(', ', $operatorNames) : 'Local networks';

        return "{$dataGb} GB data, {$speed} speed, {$duration} days validity. Networks: {$operatorText}. Top-up available: {$extendable}";
    }
}
