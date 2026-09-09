<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth.php';

$database = new Database();
$pdo = $database->connect();

$data = json_decode(file_get_contents("php://input"), true);

requireAdmin($pdo, $data);

if (empty($data['appointment_id'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "appointment_id is required"]);
    exit();
}

try {
    $stmt = $pdo->prepare("DELETE FROM appointments WHERE appointment_id = ?");
    $stmt->execute([$data['appointment_id']]);

    echo json_encode(["success" => true, "message" => "Appointment deleted"]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}