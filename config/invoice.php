<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Seller/Company Details
    |--------------------------------------------------------------------------
    |
    | These values are used on invoices to display your company's
    | information. Make sure to set these in your .env file.
    |
    */

    'seller' => [
        'company_name' => env('INVOICE_COMPANY_NAME', env('APP_NAME', 'Your Company')),
        'address' => env('INVOICE_ADDRESS', ''),
        'city' => env('INVOICE_CITY', ''),
        'postal_code' => env('INVOICE_POSTAL_CODE', ''),
        'country' => env('INVOICE_COUNTRY', ''),
        'vat_number' => env('INVOICE_VAT_NUMBER', ''),
        'registration_number' => env('INVOICE_REGISTRATION_NUMBER', ''),
        'email' => env('INVOICE_EMAIL', env('CONTACT_SUPPORT_EMAIL')),
        'phone' => env('INVOICE_PHONE', env('CONTACT_PHONE')),
        'bank_name' => env('INVOICE_BANK_NAME', ''),
        'bank_iban' => env('INVOICE_BANK_IBAN', ''),
        'bank_swift' => env('INVOICE_BANK_SWIFT', ''),
    ],

    /*
    |--------------------------------------------------------------------------
    | Invoice Settings
    |--------------------------------------------------------------------------
    |
    | General invoice configuration options.
    |
    */

    'default_vat_rate' => env('INVOICE_DEFAULT_VAT_RATE', 0),
    'payment_terms_days' => env('INVOICE_PAYMENT_TERMS', 30),
    'currency' => env('INVOICE_CURRENCY', 'EUR'),

    /*
    |--------------------------------------------------------------------------
    | PDF Settings
    |--------------------------------------------------------------------------
    |
    | Configuration for PDF generation using DomPDF.
    |
    */

    'pdf' => [
        'paper' => 'a4',
        'orientation' => 'portrait',
    ],
];
