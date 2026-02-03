<?php

namespace App\Services;

class VatService
{
    /**
     * Countries that charge VAT.
     * Only Kosovo (XK) charges VAT, rate is taken from system settings.
     */
    private const VAT_COUNTRIES = ['XK'];

    /**
     * Calculate inclusive VAT (VAT is extracted from total price).
     *
     * For Kosovo: 18% VAT means if total = €9.99:
     * - Net = 9.99 / 1.18 = €8.47
     * - VAT = 9.99 - 8.47 = €1.52
     *
     * @param float $total Total amount (VAT inclusive)
     * @param string|null $countryCode ISO country code (defaults to Kosovo)
     * @return array{net: float, vat: float, rate: float, total: float}
     */
    public function calculateInclusiveVat(float $total, ?string $countryCode = null): array
    {
        // Check if VAT is enabled in settings
        $vatEnabled = setting('invoices.vat_enabled', true);

        if (!$vatEnabled) {
            return [
                'net' => $total,
                'vat' => 0.00,
                'rate' => 0.00,
                'total' => $total,
            ];
        }

        // Get VAT rate for the country (default to Kosovo if not specified)
        $countryCode = $countryCode ?? 'XK';
        $vatRate = $this->getVatRateForCountry($countryCode);

        if ($vatRate <= 0) {
            return [
                'net' => $total,
                'vat' => 0.00,
                'rate' => 0.00,
                'total' => $total,
            ];
        }

        // Calculate inclusive VAT: Net = Total / (1 + VAT%)
        // Example: €9.99 / 1.18 = €8.4661
        $vatMultiplier = 1 + ($vatRate / 100);
        $net = round($total / $vatMultiplier, 2);
        $vat = round($total - $net, 2);

        return [
            'net' => $net,
            'vat' => $vat,
            'rate' => $vatRate,
            'total' => $total,
        ];
    }

    /**
     * Get VAT rate for a specific country.
     * Only Kosovo charges VAT (from system settings), all others are 0%.
     */
    public function getVatRateForCountry(string $countryCode): float
    {
        // Only Kosovo charges VAT
        if (in_array(strtoupper($countryCode), self::VAT_COUNTRIES, true)) {
            return (float) setting('invoices.vat_rate', 18);
        }

        return 0.00;
    }

    /**
     * Get the current VAT rate from settings.
     */
    public function getVatRate(): float
    {
        if (!setting('invoices.vat_enabled', true)) {
            return 0.00;
        }

        return (float) setting('invoices.vat_rate', 18);
    }

    /**
     * Check if VAT is enabled.
     */
    public function isVatEnabled(): bool
    {
        return setting('invoices.vat_enabled', true);
    }

    /**
     * Get list of billing countries with their VAT rates.
     * Kosovo is first (default), followed by common countries alphabetically.
     * VAT rate for Kosovo comes from system settings.
     */
    public function getBillingCountries(): array
    {
        $kosovoVatRate = (int) setting('invoices.vat_rate', 18);

        return [
            ['code' => 'XK', 'name' => 'Kosovo', 'vat_rate' => $kosovoVatRate],
            ['code' => 'AL', 'name' => 'Albania', 'vat_rate' => 0],
            ['code' => 'AT', 'name' => 'Austria', 'vat_rate' => 0],
            ['code' => 'BE', 'name' => 'Belgium', 'vat_rate' => 0],
            ['code' => 'BA', 'name' => 'Bosnia and Herzegovina', 'vat_rate' => 0],
            ['code' => 'BG', 'name' => 'Bulgaria', 'vat_rate' => 0],
            ['code' => 'HR', 'name' => 'Croatia', 'vat_rate' => 0],
            ['code' => 'CY', 'name' => 'Cyprus', 'vat_rate' => 0],
            ['code' => 'CZ', 'name' => 'Czech Republic', 'vat_rate' => 0],
            ['code' => 'DK', 'name' => 'Denmark', 'vat_rate' => 0],
            ['code' => 'EE', 'name' => 'Estonia', 'vat_rate' => 0],
            ['code' => 'FI', 'name' => 'Finland', 'vat_rate' => 0],
            ['code' => 'FR', 'name' => 'France', 'vat_rate' => 0],
            ['code' => 'DE', 'name' => 'Germany', 'vat_rate' => 0],
            ['code' => 'GR', 'name' => 'Greece', 'vat_rate' => 0],
            ['code' => 'HU', 'name' => 'Hungary', 'vat_rate' => 0],
            ['code' => 'IE', 'name' => 'Ireland', 'vat_rate' => 0],
            ['code' => 'IT', 'name' => 'Italy', 'vat_rate' => 0],
            ['code' => 'LV', 'name' => 'Latvia', 'vat_rate' => 0],
            ['code' => 'LT', 'name' => 'Lithuania', 'vat_rate' => 0],
            ['code' => 'LU', 'name' => 'Luxembourg', 'vat_rate' => 0],
            ['code' => 'MK', 'name' => 'North Macedonia', 'vat_rate' => 0],
            ['code' => 'MT', 'name' => 'Malta', 'vat_rate' => 0],
            ['code' => 'ME', 'name' => 'Montenegro', 'vat_rate' => 0],
            ['code' => 'NL', 'name' => 'Netherlands', 'vat_rate' => 0],
            ['code' => 'NO', 'name' => 'Norway', 'vat_rate' => 0],
            ['code' => 'PL', 'name' => 'Poland', 'vat_rate' => 0],
            ['code' => 'PT', 'name' => 'Portugal', 'vat_rate' => 0],
            ['code' => 'RO', 'name' => 'Romania', 'vat_rate' => 0],
            ['code' => 'RS', 'name' => 'Serbia', 'vat_rate' => 0],
            ['code' => 'SK', 'name' => 'Slovakia', 'vat_rate' => 0],
            ['code' => 'SI', 'name' => 'Slovenia', 'vat_rate' => 0],
            ['code' => 'ES', 'name' => 'Spain', 'vat_rate' => 0],
            ['code' => 'SE', 'name' => 'Sweden', 'vat_rate' => 0],
            ['code' => 'CH', 'name' => 'Switzerland', 'vat_rate' => 0],
            ['code' => 'TR', 'name' => 'Turkey', 'vat_rate' => 0],
            ['code' => 'UA', 'name' => 'Ukraine', 'vat_rate' => 0],
            ['code' => 'GB', 'name' => 'United Kingdom', 'vat_rate' => 0],
            ['code' => 'US', 'name' => 'United States', 'vat_rate' => 0],
            ['code' => 'OTHER', 'name' => 'Other', 'vat_rate' => 0],
        ];
    }
}
