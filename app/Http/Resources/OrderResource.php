<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
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
            'uuid' => $this->uuid,
            'order_number' => $this->order_number,
            'type' => $this->type,
            'status' => $this->status,
            'payment_status' => $this->payment_status,
            'amount' => $this->amount,
            'customer_email' => $this->customer_email,
            'customer_name' => $this->customer_name,
            'paid_at' => $this->paid_at,
            'completed_at' => $this->completed_at,
            'created_at' => $this->created_at,
            'package' => $this->whenLoaded('package', fn () => new PackageResource($this->package)),
            'esim_profile' => $this->whenLoaded('esimProfile', fn () => new EsimProfileResource($this->esimProfile)),
            'payments' => $this->whenLoaded('payments'),
        ];

        // Only include provider info for admin users
        if ($this->isAdminRequest($request)) {
            $data['provider_id'] = $this->provider_id;
            $data['provider'] = $this->whenLoaded('provider');
            $data['cost_price'] = $this->cost_price;
            $data['profit'] = $this->profit;
            $data['provider_order_id'] = $this->provider_order_id;
            $data['retry_count'] = $this->retry_count;
            $data['max_retries'] = $this->max_retries;
            $data['next_retry_at'] = $this->next_retry_at;
            $data['failure_reason'] = $this->failure_reason;
            $data['failure_code'] = $this->failure_code;
            $data['ip_address'] = $this->ip_address;
            $data['user_agent'] = $this->user_agent;
            $data['metadata'] = $this->metadata;
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
