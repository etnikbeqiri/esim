<?php

namespace App\Contracts;

use Illuminate\Support\Collection;

interface CompetitorContract
{
    /**
     * Unique slug for this competitor (e.g., 'thirr', 'airalo')
     */
    public function getSlug(): string;

    /**
     * Display name for the admin UI
     */
    public function getDisplayName(): string;

    /**
     * Fetch all plans from the competitor API.
     * Returns a flat collection of CompetitorPlanData DTOs.
     *
     * @return Collection<int, \App\DTOs\CompetitorPlanData>
     */
    public function fetchPlans(): Collection;

    /**
     * Currency code the competitor prices are in (e.g., 'EUR', 'USD')
     */
    public function getCurrency(): string;
}
