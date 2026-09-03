<?php
require_once __DIR__ . '/../../config/database.php';

$database = new Database();
$pdo = $database->connect();

$data = json_decode(file_get_contents("php://input"), true);

if (empty($data['rec_id'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "rec_id is required"]);
    exit();
}

try {
    $stmt = $pdo->prepare("
        UPDATE users SET
            user_name = :name,
            user_employee_id = :employee_id,
            companyid = :companyid,
            user_dealer_group_code = :dealer_code,
            user_rights = :rights,
            calendar_folder = :calendar_folder,
            user_email_address = :email,
            user_mobile_no = :mobile,
            chFunction = :chfunction,
            extn_id = :extn_id,
            extn_dial_prefix = :extn_dial_prefix,
            tg_mobile_no = :tg_mobile_no
        WHERE rec_id = :id
    ");

    $stmt->execute([
        ':name'             => $data['user_name'] ?? null,
        ':employee_id'      => $data['user_employee_id'] ?? null,
        ':companyid'        => $data['companyid'] ?? null,
        ':dealer_code'      => $data['user_dealer_group_code'] ?? null,
        ':rights'           => $data['user_rights'] ?? 'user',
        ':calendar_folder'  => $data['calendar_folder'] ?? null,
        ':email'            => $data['user_email_address'] ?? null,
        ':mobile'           => $data['user_mobile_no'] ?? null,
        ':chfunction'       => $data['chFunction'] ?? null,
        ':extn_id'          => $data['extn_id'] ?? null,
        ':extn_dial_prefix' => $data['extn_dial_prefix'] ?? null,
        ':tg_mobile_no'     => $data['tg_mobile_no'] ?? null,
        ':id'               => $data['rec_id'],
    ]);

    echo json_encode(["success" => true, "message" => "User updated successfully"]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}