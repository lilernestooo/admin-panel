<?php
require_once __DIR__ . '/../../middleware/bootstrap.php';

requireAdmin($pdo);

try {
    $stmt = $pdo->query("
        SELECT log_id, action, performed_by, target_userid, target_user_name, details, created_at
        FROM audit_logs
        ORDER BY log_id DESC
        LIMIT 500
    ");
    $logs = $stmt->fetchAll();

    echo json_encode(["success" => true, "data" => $logs]);
} catch (PDOException $e) {
    error_log("List audit error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Something went wrong. Please try again."]);
}