<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DeviceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'release_year' => $this->release_year,
            'esim_supported' => $this->esim_supported,
            'is_active' => $this->is_active,
            'model_identifiers' => $this->when(
                $request->user()?->isAdmin(),
                $this->model_identifiers
            ),
            'brand' => new BrandResource($this->whenLoaded('brand')),
            'brand_name' => $this->when(
                $this->relationLoaded('brand'),
                fn() => $this->brand?->name
            ),
        ];
    }
}
