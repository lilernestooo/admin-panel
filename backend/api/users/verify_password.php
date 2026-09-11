<?php
require_once __DIR__ . '/../../middleware/bootstrap.php';

$requesterId = requireAuth(); // must be logged in -- endpoint no longer open to anyone

if (empty($data['password'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Password is required"]);
    exit();
}

// Basic throttling: cap attempts per session to slow down brute-force guessing.
if (!isset($_SESSION['pw_verify_attempts'])) {
    $_SESSION['pw_verify_attempts'] = 0;
}
if ($_SESSION['pw_verify_attempts'] >= 5) {
    http_response_code(429);
    echo json_encode(["success" => false, "message" => "Too many attempts. Please try again later."]);
    exit();
}

try {
    // Always check the LOGGED-IN user's own account -- ignore any userid
    // the client might send, and never trust it for identity.
    $stmt = $pdo->prepare("SELECT user_password FROM users WHERE rec_id = ?");
    $stmt->execute([$requesterId]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($data['password'], $user['user_password'])) {
        $_SESSION['pw_verify_attempts']++;
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Incorrect password"]);
        exit();
    }

    $_SESSION['pw_verify_attempts'] = 0;
    echo json_encode(["success" => true, "message" => "Password verified"]);
} catch (PDOException $e) {
    error_log("Verify password error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Something went wrong. Please try again."]);
}