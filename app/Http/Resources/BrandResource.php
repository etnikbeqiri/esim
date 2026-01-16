<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BrandResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'logo_url' => $this->logo_url,
            'is_active' => $this->is_active,
            'sort_order' => $this->sort_order,
            'devices_count' => $this->whenCounted('devices'),
            'devices' => DeviceResource::collection($this->whenLoaded('devices')),
        ];
    }
}
