<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EsimProfileResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = [
            'iccid' => $this->iccid,
            'activation_code' => $this->activation_code,
            'smdp_address' => $this->smdp_address,
            'lpa_string' => $this->lpa_string,
            'qr_code_data' => $this->qr_code_data,
            'apn' => $this->apn,
            'status' => $this->status,
            'data_used_mb' => $this->data_used_mb,
            'data_total_mb' => $this->data_total_mb,
            'data_remaining_mb' => round($this->data_remaining_bytes / (1024 * 1024), 2),
            'data_usage_percentage' => $this->data_usage_percentage,
            'is_activated' => $this->is_activated,
            'topup_available' => $this->topup_available,
            'activated_at' => $this->activated_at,
            'expires_at' => $this->expires_at,
        ];

        // Only include provider data for admin users
        if ($this->isAdminRequest($request)) {
            $data['provider_data'] = $this->provider_data;
            $data['last_usage_check_at'] = $this->last_usage_check_at;
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
