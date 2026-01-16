<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Contact Information
    |--------------------------------------------------------------------------
    |
    | These values are used throughout the application for displaying
    | contact information on support pages, legal documents, etc.
    |
    */

    'support_email' => env('CONTACT_SUPPORT_EMAIL', 'support@example.com'),
    'legal_email' => env('CONTACT_LEGAL_EMAIL', 'legal@example.com'),
    'privacy_email' => env('CONTACT_PRIVACY_EMAIL', 'privacy@example.com'),
    'phone' => env('CONTACT_PHONE'),
    'whatsapp' => env('CONTACT_WHATSAPP'),

    /*
    |--------------------------------------------------------------------------
    | Company Details
    |--------------------------------------------------------------------------
    |
    | Company information displayed on contact pages and in the footer.
    | These are separate from invoice details for more flexibility.
    |
    */

    'company_name' => env('CONTACT_COMPANY_NAME', env('APP_NAME', 'Your Company')),
    'company_address' => env('CONTACT_COMPANY_ADDRESS', ''),
    'company_city' => env('CONTACT_COMPANY_CITY', ''),
    'company_postal_code' => env('CONTACT_COMPANY_POSTAL_CODE', ''),
    'company_country' => env('CONTACT_COMPANY_COUNTRY', ''),
    'company_vat' => env('CONTACT_COMPANY_VAT', ''),
    'company_registration' => env('CONTACT_COMPANY_REGISTRATION', ''),

    /*
    |--------------------------------------------------------------------------
    | Admin Notification Email
    |--------------------------------------------------------------------------
    |
    | Email address for receiving admin notifications about orders,
    | payments, and system events.
    |
    */

    'admin_email' => env('ADMIN_EMAIL', 'admin@example.com'),
];
