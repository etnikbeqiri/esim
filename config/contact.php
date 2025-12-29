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
    | Admin Notification Email
    |--------------------------------------------------------------------------
    |
    | Email address for receiving admin notifications about orders,
    | payments, and system events.
    |
    */

    'admin_email' => env('ADMIN_EMAIL', 'admin@example.com'),
];
