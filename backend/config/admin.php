<?php

$superAdminEmail = strtolower(trim((string) env('SUPER_ADMIN_EMAIL', '')));

return [
    'super_admin_email' => $superAdminEmail,
    'frontend_url' => rtrim((string) env('FRONTEND_URL', 'http://localhost:5173'), '/'),
];
