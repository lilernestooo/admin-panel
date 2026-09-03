<?php
require_once __DIR__ . '/../../config/database.php';

$database = new Database();
$pdo = $database->connect();

$data = json_decode(file_get_contents("php://input"), true);

if (empty($data['userid']) || empty($data['user_password'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Userid and password are required"]);
    exit();
}

try {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE userid = ?");
    $stmt->execute([$data['userid']]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($data['user_password'], $user['user_password'])) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Invalid userid or password"]);
        exit();
    }

    $update = $pdo->prepare("UPDATE users SET last_loggin = NOW() WHERE rec_id = ?");
    $update->execute([$user['rec_id']]);

    unset($user['user_password']);

    echo json_encode(["success" => true, "message" => "Login successful", "user" => $user]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}