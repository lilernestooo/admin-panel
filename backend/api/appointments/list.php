<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth.php';

$database = new Database();
$pdo = $database->connect();

$requesterId = $_GET['requester_id'] ?? null;
requireAdmin($pdo, ['requester_id' => $requesterId]);

$userRecId = $_GET['user_rec_id'] ?? null;

if (empty($userRecId)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "user_rec_id is required"]);
    exit();
}

try {
    $stmt = $pdo->prepare("
        SELECT appointment_id, user_rec_id, appointment_date, appointment_time,
               title, notes, status, created_at, updated_at
        FROM appointments
        WHERE user_rec_id = ?
        ORDER BY appointment_date ASC, appointment_time ASC
    ");
    $stmt->execute([$userRecId]);
    $appointments = $stmt->fetchAll();

    echo json_encode(["success" => true, "data" => $appointments]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}