<?php

namespace App\Http\Requests\Admin;

use App\Enums\InvoiceType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class GenerateInvoiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Admin middleware handles auth
    }

    public function rules(): array
    {
        $rules = [
            'customer_id' => ['required', 'exists:customers,id'],
            'type' => ['required', new Enum(InvoiceType::class)],
        ];

        $type = $this->input('type');

        if ($type === InvoiceType::Purchase->value) {
            $rules['order_ids'] = ['required', 'array', 'min:1'];
            $rules['order_ids.*'] = ['required', 'exists:orders,uuid'];
        }

        if ($type === InvoiceType::TopUp->value) {
            $rules['transaction_ids'] = ['required', 'array', 'min:1'];
            $rules['transaction_ids.*'] = ['required', 'exists:balance_transactions,uuid'];
        }

        if ($type === InvoiceType::Statement->value) {
            $rules['start_date'] = ['required', 'date'];
            $rules['end_date'] = ['required', 'date', 'after_or_equal:start_date'];
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'order_ids.required' => 'Please select at least one order.',
            'order_ids.min' => 'Please select at least one order.',
            'transaction_ids.required' => 'Please select at least one transaction.',
            'transaction_ids.min' => 'Please select at least one transaction.',
            'start_date.required' => 'Please select a start date.',
            'end_date.required' => 'Please select an end date.',
            'end_date.after_or_equal' => 'End date must be on or after the start date.',
        ];
    }
}
