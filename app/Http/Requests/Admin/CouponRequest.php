<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CouponRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Admin middleware handles auth
    }

    public function rules(): array
    {
        $couponId = $this->route('coupon')?->id;

        return [
            'code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('coupons', 'code')->ignore($couponId),
            ],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'type' => ['required', 'in:percentage,fixed_amount'],
            'value' => ['required', 'numeric', 'min:0'],
            'min_order_amount' => ['required', 'numeric', 'min:0'],
            'usage_limit' => ['nullable', 'integer', 'min:1'],
            'per_customer_limit' => ['required', 'integer', 'min:1'],
            'valid_from' => ['nullable', 'date'],
            'valid_until' => ['nullable', 'date', 'after:valid_from'],
            'is_active' => ['boolean'],
            'is_stackable' => ['boolean'],
            'first_time_only' => ['boolean'],
            'allowed_countries' => ['nullable', 'array'],
            'allowed_countries.*' => ['integer', 'exists:countries,id'],
            'allowed_providers' => ['nullable', 'array'],
            'allowed_providers.*' => ['integer', 'exists:providers,id'],
            'allowed_packages' => ['nullable', 'array'],
            'allowed_packages.*' => ['integer', 'exists:packages,id'],
            'exclude_packages' => ['nullable', 'array'],
            'exclude_packages.*' => ['integer', 'exists:packages,id'],
            'allowed_customer_types' => ['nullable', 'array'],
            'allowed_customer_types.*' => ['in:b2b,b2c'],
        ];
    }

    public function messages(): array
    {
        return [
            'code.required' => 'Coupon code is required',
            'code.unique' => 'This coupon code already exists',
            'name.required' => 'Coupon name is required',
            'type.required' => 'Coupon type is required',
            'type.in' => 'Coupon type must be either percentage or fixed amount',
            'value.required' => 'Discount value is required',
            'value.min' => 'Discount value cannot be negative',
            'min_order_amount.required' => 'Minimum order amount is required',
            'min_order_amount.min' => 'Minimum order amount cannot be negative',
            'usage_limit.min' => 'Usage limit must be at least 1',
            'per_customer_limit.required' => 'Per customer limit is required',
            'per_customer_limit.min' => 'Per customer limit must be at least 1',
            'valid_until.after' => 'End date must be after start date',
            'allowed_countries.*.exists' => 'One or more selected countries are invalid',
            'allowed_providers.*.exists' => 'One or more selected providers are invalid',
            'allowed_packages.*.exists' => 'One or more selected packages are invalid',
            'exclude_packages.*.exists' => 'One or more excluded packages are invalid',
            'allowed_customer_types.*.in' => 'Customer types must be either b2b or b2c',
        ];
    }

    protected function prepareForValidation(): void
    {
        // Convert code to uppercase and remove spaces
        if ($this->has('code')) {
            $this->merge([
                'code' => strtoupper(str_replace(' ', '', $this->input('code'))),
            ]);
        }

        // Properly parse boolean values from the request
        $this->merge([
            'is_active' => $this->boolean('is_active'),
            'is_stackable' => $this->boolean('is_stackable'),
            'first_time_only' => $this->boolean('first_time_only'),
        ]);
    }
}
