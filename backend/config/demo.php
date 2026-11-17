<?php

return [
    'enabled' => env('DEMO_MODE', true),
    'accounts' => ['admin1@school.test', 'gv001@school.test', 'sv0001@school.test'],
    // Reset is restricted to a separate database whose name ends with _demo.
    'allow_reset' => env('DEMO_ALLOW_RESET', false),
];
