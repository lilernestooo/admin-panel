<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth.php';
require_once __DIR__ . '/../../config/audit.php';

$database = new Database();
$pdo = $database->connect();

$data = json_decode(file_get_contents("php://input"), true);

requireAdmin($pdo, $data);

if (empty($data['rec_id'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "rec_id is required"]);
    exit();
}

try {
    // Capture the target user's identity before deleting, since it won't exist afterward
    $existing = $pdo->prepare("SELECT userid, user_name FROM users WHERE rec_id = ?");
    $existing->execute([$data['rec_id']]);
    $existingUser = $existing->fetch();

    $stmt = $pdo->prepare("DELETE FROM users WHERE rec_id = ?");
    $stmt->execute([$data['rec_id']]);

    logAudit(
        $pdo,
        'DELETE',
        $data['requester_id'],
        $existingUser['userid'] ?? null,
        $existingUser['user_name'] ?? null
    );

    echo json_encode(["success" => true, "message" => "User deleted successfully"]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}