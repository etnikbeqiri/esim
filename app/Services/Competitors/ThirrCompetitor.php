<?php

namespace App\Services\Competitors;

use App\Contracts\CompetitorContract;
use App\DTOs\CompetitorPlanData;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ThirrCompetitor implements CompetitorContract
{
    private const API_URL = 'https://api.thirr.com/app/destinationsWithDataPlans';

    public function getSlug(): string
    {
        return 'thirr';
    }

    public function getDisplayName(): string
    {
        return 'Thirr';
    }

    public function getCurrency(): string
    {
        return 'EUR';
    }

    public function fetchPlans(): Collection
    {
        $response = Http::timeout(30)
            ->connectTimeout(10)
            ->withHeaders([
                'accept' => 'application/json',
                'content-type' => 'application/json',
                'origin' => 'https://app.thirr.com',
                'referer' => 'https://app.thirr.com/',
            ])
            ->get(self::API_URL);

        if (! $response->successful()) {
            Log::error('Thirr API request failed', [
                'status' => $response->status(),
                'body' => mb_substr($response->body(), 0, 500),
            ]);

            return collect();
        }

        $json = $response->json();

        if (($json['status'] ?? '') !== 'success' || ! isset($json['data'])) {
            Log::warning('Thirr API returned unexpected format', [
                'status' => $json['status'] ?? null,
                'code' => $json['code'] ?? null,
            ]);

            return collect();
        }

        return $this->transformDestinations($json['data']);
    }

    private function transformDestinations(array $destinations): Collection
    {
        $plans = collect();

        foreach ($destinations as $destination) {
            $destinationCode = $destination['code'] ?? '';
            $destinationName = $destination['name'] ?? '';

            // Build list of country ISO codes covered by this destination
            $countryCodes = collect($destination['countries'] ?? [])
                ->pluck('code')
                ->map(fn (string $code) => strtoupper($code))
                ->values()
                ->all();

            // If single-country destination and countries list is empty, use destination code itself
            if (empty($countryCodes) && strlen($destinationCode) === 2) {
                $countryCodes = [strtoupper($destinationCode)];
            }

            // Regional = covers multiple countries (EU, Balkan, etc.)
            $isRegional = count($countryCodes) > 1;

            foreach ($destination['dataPlans'] ?? [] as $plan) {
                $plans->push(new CompetitorPlanData(
                    competitor: $this->getSlug(),
                    planCode: $plan['code'] ?? '',
                    planName: $plan['name'] ?? '',
                    price: (float) ($plan['price'] ?? 0),
                    currency: $this->getCurrency(),
                    dataGb: (int) ($plan['dataSizeReadableGB'] ?? 0),
                    durationDays: (int) ($plan['duration'] ?? 0),
                    destinationCode: $destinationCode,
                    destinationName: $destinationName,
                    countryCodes: $countryCodes,
                    isRegional: $isRegional,
                ));
            }
        }

        return $plans;
    }
}
