<?php

namespace App\Contracts;

use App\DTOs\EsimProfileData;
use App\DTOs\PackageData;
use App\DTOs\PurchaseResult;
use App\Models\Provider;
use Illuminate\Support\Collection;

interface ProviderContract
{
    /**
     * Get the provider slug identifier
     */
    public function getSlug(): string;

    /**
     * Get the provider model
     */
    public function getProvider(): Provider;

    /**
     * Fetch available packages with pagination
     *
     * @return Collection<int, PackageData>
     */
    public function fetchPackages(int $page = 1, int $perPage = 100): Collection;

    /**
     * Get total number of available packages
     */
    public function getPackageCount(): int;

    /**
     * Purchase an eSIM package
     */
    public function purchaseEsim(string $packageId): PurchaseResult;

    /**
     * Get eSIM profile details including usage
     */
    public function getEsimProfile(string $providerOrderId): EsimProfileData;

    /**
     * Check package stock availability
     */
    public function checkStock(string $packageId): bool;

    /**
     * Get rate limit in milliseconds between requests
     */
    public function getRateLimitMs(): int;

    /**
     * Apply markup to cost price
     */
    public function calculateRetailPrice(float $costPrice): float;

    /**
     * Test connection to provider API
     */
    public function testConnection(): bool;
}
