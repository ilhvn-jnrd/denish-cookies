<?php

return [
    'merchant_id' => env('MIDTRANS_MERCHANT_ID', 'M004762091'),
    'client_key' => env('MIDTRANS_CLIENT_KEY', 'Mid-client-t-YHIi4kIXebf6cF'),
    'server_key' => env('MIDTRANS_SERVER_KEY', ''),
    'is_production' => (bool) env('MIDTRANS_IS_PRODUCTION', true),

    // API URLs
    'snap_url' => env('MIDTRANS_IS_PRODUCTION', true)
        ? 'https://app.midtrans.com/snap/v1/transactions'
        : 'https://app.sandbox.midtrans.com/snap/v1/transactions',

    'snap_js_url' => env('MIDTRANS_IS_PRODUCTION', true)
        ? 'https://app.midtrans.com/snap/snap.js'
        : 'https://app.sandbox.midtrans.com/snap/snap.js',

    'api_url' => env('MIDTRANS_IS_PRODUCTION', true)
        ? 'https://api.midtrans.com/v2'
        : 'https://api.sandbox.midtrans.com/v2',
];
