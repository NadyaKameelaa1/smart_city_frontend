<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    
    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:5173', 
        'http://localhost:5173', 
        'http://127.0.0.1:5173', 
        'http://127.0.0.1:8000', 
        'http://localhost:8000', 
        'http://localhost:0.0.0.0', 
        'http://41.216.191.37', 
        'http://41.216.191.37/api', 
        "http://41.216.191.37:5173",
        'https://purbalinggasmartcity.netlify.app',  
        'http://smartcitybackend-main-oqgeeg.free.laravel.cloud', 
        ],

    'allowed_origins_patterns' => ['/^http:\/\/192\.168\..*/'],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
