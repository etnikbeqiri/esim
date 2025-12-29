<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CountryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'iso_code' => $this->iso_code,
            'phone_code' => $this->phone_code,
            'flag_emoji' => $this->flag_emoji,
            'region' => $this->region,
            'is_popular' => $this->is_popular,
        ];
    }
}
