<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/auth.php';

$database = new Database();
$pdo = $database->connect();

$data = json_decode(file_get_contents("php://input"), true);

requireAdmin($pdo, $data);

$required = ['user_rec_id', 'appointment_date', 'title'];
foreach ($required as $field) {
    if (empty($data[$field])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Missing required field: $field"]);
        exit();
    }
}

$allowedStatus = ['scheduled', 'completed', 'cancelled'];
$status = $data['status'] ?? 'scheduled';
if (!in_array($status, $allowedStatus, true)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid status"]);
    exit();
}

try {
    if (!empty($data['appointment_id'])) {
        // Update existing appointment
        $stmt = $pdo->prepare("
            UPDATE appointments SET
                appointment_date = :appointment_date,
                appointment_time = :appointment_time,
                title = :title,
                notes = :notes,
                status = :status
            WHERE appointment_id = :appointment_id AND user_rec_id = :user_rec_id
        ");
        $stmt->execute([
            ':appointment_date' => $data['appointment_date'],
            ':appointment_time' => $data['appointment_time'] ?? null,
            ':title'            => $data['title'],
            ':notes'            => $data['notes'] ?? null,
            ':status'           => $status,
            ':appointment_id'   => $data['appointment_id'],
            ':user_rec_id'      => $data['user_rec_id'],
        ]);

        echo json_encode(["success" => true, "message" => "Appointment updated"]);
    } else {
        // Create new appointment
        $stmt = $pdo->prepare("
            INSERT INTO appointments (user_rec_id, appointment_date, appointment_time, title, notes, status)
            VALUES (:user_rec_id, :appointment_date, :appointment_time, :title, :notes, :status)
        ");
        $stmt->execute([
            ':user_rec_id'      => $data['user_rec_id'],
            ':appointment_date' => $data['appointment_date'],
            ':appointment_time' => $data['appointment_time'] ?? null,
            ':title'            => $data['title'],
            ':notes'            => $data['notes'] ?? null,
            ':status'           => $status,
        ]);

        echo json_encode([
            "success" => true,
            "message" => "Appointment created",
            "appointment_id" => $pdo->lastInsertId(),
        ]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}