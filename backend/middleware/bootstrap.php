<?php
// Single entry point every endpoint should include first.
// Guarantees CORS, session, DB connection, and body parsing happen
// the same way, every time -- nothing left for a new endpoint to forget.

require_once __DIR__ . '/cors.php';
require_once __DIR__ . '/../config/env.php';
require_once __DIR__ . '/../config/auth.php';
require_once __DIR__ . '/../config/database.php';

loadEnv(__DIR__ . '/../.env');
startSecureSession();
enforceSessionTimeout();

$database = new Database();
$pdo = $database->connect();

$rawBody = file_get_contents("php://input");
$data = json_decode($rawBody, true);

// If the client sent a body but it wasn't valid JSON, fail clearly
// instead of letting every endpoint silently treat $data as null.
if ($rawBody !== '' && json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid JSON in request body"]);
    exit();
}
$data = $data ?? [];