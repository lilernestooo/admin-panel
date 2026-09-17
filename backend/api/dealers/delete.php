<?php
require_once __DIR__ . '/../../middleware/bootstrap.php';
require_once __DIR__ . '/../../config/audit.php';

requireAdmin($pdo);
$requesterUserid = $_SESSION['userid'];

if (empty($data['rec_id'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "rec_id is required"]);
    exit();
}

try {
    // Capture identity before deleting, for the audit log
    $existing = $pdo->prepare("SELECT dealerid, dealername FROM tbl_dealership WHERE rec_id = ?");
    $existing->execute([$data['rec_id']]);
    $existingDealer = $existing->fetch();

    if (!$existingDealer) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Dealer not found"]);
        exit();
    }

    $stmt = $pdo->prepare("DELETE FROM tbl_dealership WHERE rec_id = ?");
    $stmt->execute([$data['rec_id']]);

    logAudit($pdo, 'DELETE', $requesterUserid, $existingDealer['dealerid'], $existingDealer['dealername']);

    echo json_encode(["success" => true, "message" => "Dealer deleted successfully"]);
} catch (PDOException $e) {
    error_log("Delete dealer error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Something went wrong. Please try again."]);
}