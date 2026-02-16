<?php
// Simple cache test
require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';

// Check cache
$cached = $app->make('cache')->store('file')->get('test-key');
echo "Cached value: " . ($cached ?: "None") . "\n";

// Write test
$app->make('cache')->store('file')->put('test-key', 'Hello from cache', 3600);
echo "Wrote to cache\n";

// Read test  
$cached = $app->make('cache')->store('file')->get('test-key');
echo "Read from cache: " . $cached . "\n";
