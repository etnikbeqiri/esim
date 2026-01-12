<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | eSIM Provider Services
    |--------------------------------------------------------------------------
    */

    'providers' => [
        'smspool' => [
            'api_key' => env('SMSPOOL_API_KEY'),
        ],
        // Future providers
        // 'airalo' => [
        //     'api_key' => env('AIRALO_API_KEY'),
        // ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Payment Gateway Configuration
    |--------------------------------------------------------------------------
    */

    'payment' => [
        'default' => env('PAYMENT_PROVIDER', 'payrexx'),
    ],

    'payrexx' => [
        'instance' => env('PAYREXX_PAYMENT_PROVIDER_INSTANCE_NAME'),
        'secret' => env('PAYREXX_PAYMENT_PROVIDER_SECRET'),
        'webhook_secret' => env('PAYREXX_WEBHOOK_SECRET'),
        'checkout_validity_minutes' => 30,
    ],

    'stripe' => [
        'key' => env('STRIPE_KEY'),
        'secret' => env('STRIPE_SECRET'),
        'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
    ],

    'paysera' => [
        'project_id' => env('PAYSERA_PROJECT_ID'),
        'password' => env('PAYSERA_PASSWORD'),
        'test_mode' => env('PAYSERA_TEST_MODE', false),
    ],

];
