<?php
require_once __DIR__ . '/../../config/database.php';

$database = new Database();
$pdo = $database->connect();

try {
    $stmt = $pdo->query("
        SELECT rec_id, userid, user_employee_id, user_name, companyid,
               user_dealer_group_code, user_rights, calendar_folder,
               chg_password, chg_psswrd_datetime, user_email_address,
               user_mobile_no, last_loggin, chFunction, extn_id,
               extn_dial_prefix, tg_mobile_no, otp_code, otp_expires_at,
               created_at, updated_at
        FROM users
        ORDER BY rec_id DESC
    ");
    $users = $stmt->fetchAll();

    echo json_encode(["success" => true, "data" => $users]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}