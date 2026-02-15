<?php

namespace App\Providers;

use App\Contracts\ProviderContract;
use App\Models\Provider;
use App\Services\Providers\SmsPoolProvider;
use Illuminate\Support\ServiceProvider;

class ProviderServiceProvider extends ServiceProvider
{
    /**
     * Map of provider slugs to their implementation classes
     */
    protected array $providerMap = [
        'smspool' => SmsPoolProvider::class,
        // Future providers:
        // 'airalo' => AiraloProvider::class,
        // 'esimgo' => EsimGoProvider::class,
    ];

    public function register(): void
    {
        // Register the provider factory as a singleton
        $this->app->singleton('esim.provider.factory', function ($app) {
            return new ProviderFactory($this->providerMap);
        });

        // Register alias for convenience
        $this->app->alias('esim.provider.factory', ProviderFactory::class);
    }

    public function boot(): void
    {
        //
    }

    /**
     * Get all registered provider slugs
     */
    public function getRegisteredProviders(): array
    {
        return array_keys($this->providerMap);
    }
}

/**
 * Factory class for creating provider instances
 */
class ProviderFactory
{
    public function __construct(
        protected array $providerMap
    ) {}

    /**
     * Create a provider instance by slug
     */
    public function make(string $slug): ProviderContract
    {
        $provider = Provider::where('slug', $slug)
            ->where('is_active', true)
            ->first();

        if (!$provider) {
            throw new \InvalidArgumentException(
                "Provider not found or inactive: {$slug}"
            );
        }

        return $this->createFromModel($provider);
    }

    /**
     * Create a provider instance from model
     */
    public function createFromModel(Provider $provider): ProviderContract
    {
        $class = $this->providerMap[$provider->slug] ?? null;

        if (!$class) {
            throw new \InvalidArgumentException(
                "No implementation registered for provider: {$provider->slug}"
            );
        }

        return new $class($provider);
    }

    /**
     * Get all registered provider slugs
     */
    public function getRegisteredSlugs(): array
    {
        return array_keys($this->providerMap);
    }

    /**
     * Check if a provider implementation exists
     */
    public function hasProvider(string $slug): bool
    {
        return isset($this->providerMap[$slug]);
    }

    /**
     * Get all active providers with their implementations
     */
    public function getAllActive(): array
    {
        $providers = Provider::where('is_active', true)->get();

        return $providers
            ->filter(fn ($p) => $this->hasProvider($p->slug))
            ->map(fn ($p) => $this->createFromModel($p))
            ->all();
    }

    /**
     * Create a provider instance by provider ID
     */
    public function makeById(int $providerId): ProviderContract
    {
        $provider = Provider::find($providerId);

        if (!$provider) {
            throw new \InvalidArgumentException(
                "Provider not found with ID: {$providerId}"
            );
        }

        return $this->createFromModel($provider);
    }
}
