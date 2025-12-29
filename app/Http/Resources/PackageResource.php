<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PackageResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'data_mb' => $this->data_mb,
            'data_label' => $this->data_label,
            'validity_days' => $this->validity_days,
            'validity_label' => $this->validity_label,
            'retail_price' => $this->retail_price,
            'network_type' => $this->network_type,
            'supported_networks' => $this->supported_networks,
            'coverage_type' => $this->coverage_type,
            'coverage_countries' => $this->coverage_countries,
            'sms_included' => $this->sms_included,
            'voice_included' => $this->voice_included,
            'hotspot_allowed' => $this->hotspot_allowed,
            'is_popular' => $this->is_popular,
            'is_featured' => $this->is_featured,
            'country' => $this->whenLoaded('country', fn () => new CountryResource($this->country)),
        ];

        // Only include provider info for admin users
        if ($this->isAdminRequest($request)) {
            $data['provider_id'] = $this->provider_id;
            $data['provider'] = $this->whenLoaded('provider');
            $data['cost_price'] = $this->cost_price;
            $data['custom_retail_price'] = $this->custom_retail_price;
            $data['profit_margin'] = $this->profit_margin;
            $data['provider_package_id'] = $this->provider_package_id;
        }

        return $data;
    }

    /**
     * Check if this is an admin request.
     */
    protected function isAdminRequest(Request $request): bool
    {
        $user = $request->user();
        return $user && method_exists($user, 'isAdmin') && $user->isAdmin();
    }
}
