<?php
require_once __DIR__ . '/../../middleware/bootstrap.php';

if (empty($data['userid']) || empty($data['user_password'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Userid and password are required"]);
    exit();
}

try {
    // Select only the columns the frontend actually needs -- never SELECT *
    // on a users table, since it also contains password hashes, OTP codes, etc.
    $stmt = $pdo->prepare(
        "SELECT rec_id, userid, user_password, user_name, user_rights, user_email_address,
                user_mobile_no, companyid, user_employee_id
         FROM users WHERE userid = ?"
    );
    $stmt->execute([$data['userid']]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($data['user_password'], $user['user_password'])) {
        // Same generic message + a small delay regardless of which check failed,
        // so an attacker can't use response differences/timing to enumerate valid userids.
        usleep(300000);
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Invalid userid or password"]);
        exit();
    }

    $update = $pdo->prepare("UPDATE users SET last_loggin = NOW() WHERE rec_id = ?");
    $update->execute([$user['rec_id']]);

    unset($user['user_password']);

    // Regenerate the session ID on login to prevent session fixation,
    // then store identity server-side -- this is now the single source of truth.
    session_regenerate_id(true);
    $_SESSION['user_id']     = $user['rec_id'];
    $_SESSION['userid']      = $user['userid'];
    $_SESSION['user_rights'] = $user['user_rights'];

    echo json_encode(["success" => true, "message" => "Login successful", "user" => $user]);
} catch (PDOException $e) {
    error_log("Login error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Something went wrong. Please try again."]);
}