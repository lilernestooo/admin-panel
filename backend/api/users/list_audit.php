<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth.php';

$database = new Database();
$pdo = $database->connect();

$requesterId = $_GET['requester_id'] ?? null;
requireAdmin($pdo, ['requester_id' => $requesterId]);

try {
    $stmt = $pdo->query("
        SELECT log_id, action, performed_by, target_userid, target_user_name, details, created_at
        FROM audit_logs
        ORDER BY log_id DESC
    ");
    $logs = $stmt->fetchAll();

    echo json_encode(["success" => true, "data" => $logs]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}