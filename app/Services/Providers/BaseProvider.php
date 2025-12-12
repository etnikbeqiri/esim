<?php

namespace App\Services\Providers;

use App\Contracts\ProviderContract;
use App\Models\Provider;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;

abstract class BaseProvider implements ProviderContract
{
    protected Provider $provider;
    protected string $apiKey;
    protected string $baseUrl;
    protected int $rateLimitMs;
    protected float $markupPercentage;

    public function __construct(Provider $provider)
    {
        $this->provider = $provider;
        $this->baseUrl = $provider->api_base_url;
        $this->rateLimitMs = $provider->rate_limit_ms;
        $this->markupPercentage = (float) $provider->markup_percentage;
        $this->apiKey = $this->resolveApiKey();
    }

    public function getSlug(): string
    {
        return $this->provider->slug;
    }

    public function getProvider(): Provider
    {
        return $this->provider;
    }

    public function getRateLimitMs(): int
    {
        return $this->rateLimitMs;
    }

    public function calculateRetailPrice(float $costPrice): float
    {
        return round($costPrice * (1 + $this->markupPercentage / 100), 2);
    }

    protected function resolveApiKey(): string
    {
        $envKey = strtoupper($this->provider->slug) . '_API_KEY';
        $apiKey = config("services.providers.{$this->provider->slug}.api_key")
            ?? env($envKey);

        if (empty($apiKey)) {
            throw new \RuntimeException(
                "API key not configured for provider: {$this->provider->slug}"
            );
        }

        return $apiKey;
    }

    protected function applyRateLimit(): void
    {
        $key = "provider-request-{$this->getSlug()}";

        if (RateLimiter::tooManyAttempts($key, 1)) {
            $sleepMs = $this->rateLimitMs;
            Log::debug("Rate limiting provider {$this->getSlug()}, sleeping {$sleepMs}ms");
            usleep($sleepMs * 1000);
        }

        RateLimiter::hit($key, $this->rateLimitMs / 1000);
    }

    protected function http(): PendingRequest
    {
        return Http::baseUrl($this->baseUrl)
            ->timeout(30)
            ->connectTimeout(10)
            ->retry(3, 100, function ($exception, $request) {
                return $exception instanceof \Illuminate\Http\Client\ConnectionException;
            });
    }

    protected function makeGetRequest(string $endpoint, array $params = []): array
    {
        $this->applyRateLimit();

        $response = $this->http()
            ->withHeaders($this->getHeaders())
            ->get($endpoint, $params);

        if (!$response->successful()) {
            $this->handleErrorResponse($response);
        }

        return $response->json() ?? [];
    }

    protected function makePostRequest(string $endpoint, array $data = []): array
    {
        $this->applyRateLimit();

        $response = $this->http()
            ->withHeaders($this->getHeaders())
            ->asForm()
            ->post($endpoint, $data);

        if (!$response->successful()) {
            $this->handleErrorResponse($response);
        }

        return $response->json() ?? [];
    }

    protected function handleErrorResponse($response): void
    {
        $status = $response->status();
        $body = $response->body();

        Log::error("Provider API error", [
            'provider' => $this->getSlug(),
            'status' => $status,
            'body' => $body,
        ]);

        $errorMessage = "Provider API error: HTTP {$status}";

        if ($json = $response->json()) {
            $errorMessage = $json['message'] ?? $json['error'] ?? $errorMessage;
        }

        throw new \RuntimeException($errorMessage);
    }

    protected function isRetryableError(string $message): bool
    {
        $patterns = [
            'timeout',
            'rate limit',
            'too many requests',
            'temporarily unavailable',
            'service unavailable',
            '503',
            '429',
            '502',
            '504',
            'connection',
            'try again',
            'insufficient balance',
            'insufficient funds',
            'insufficient credit',
            'top up',
        ];

        $messageLower = strtolower($message);

        foreach ($patterns as $pattern) {
            if (str_contains($messageLower, $pattern)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get headers for API requests - override in child classes
     */
    abstract protected function getHeaders(): array;
}
