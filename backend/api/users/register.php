<?php
require_once __DIR__ . '/../../config/database.php';

$database = new Database();
$pdo = $database->connect();

$data = json_decode(file_get_contents("php://input"), true);

$required = ['userid', 'user_password', 'user_name'];
foreach ($required as $field) {
    if (empty($data[$field])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Missing required field: $field"]);
        exit();
    }
}

try {
    $check = $pdo->prepare("SELECT rec_id FROM users WHERE userid = ? OR (user_email_address = ? AND ? != '')");
    $check->execute([$data['userid'], $data['user_email_address'] ?? '', $data['user_email_address'] ?? '']);
    if ($check->fetch()) {
        http_response_code(409);
        echo json_encode(["success" => false, "message" => "Userid or email already exists"]);
        exit();
    }

    $hashedPassword = password_hash($data['user_password'], PASSWORD_BCRYPT);

   $stmt = $pdo->prepare("
    INSERT INTO users
    (userid, user_password, user_employee_id, user_name, companyid,
     user_dealer_group_code, user_rights, calendar_folder, user_email_address,
     user_mobile_no, chFunction, extn_id, extn_dial_prefix, tg_mobile_no)
    VALUES
    (:userid, :password, :employee_id, :name, :companyid,
     :dealer_code, :rights, :calendar_folder, :email, :mobile, :chfunction,
     :extn_id, :extn_dial_prefix, :tg_mobile_no)
");

$stmt->execute([
    ':userid'            => $data['userid'],
    ':password'          => $hashedPassword,
    ':employee_id'       => $data['user_employee_id'] ?? null,
    ':name'              => $data['user_name'],
    ':companyid'         => $data['companyid'] ?? null,
    ':dealer_code'       => $data['user_dealer_group_code'] ?? null,
    ':rights'            => $data['user_rights'] ?? 'user',
    ':calendar_folder'   => $data['calendar_folder'] ?? null,
    ':email'             => $data['user_email_address'] ?? null,
    ':mobile'            => $data['user_mobile_no'] ?? null,
    ':chfunction'        => $data['chFunction'] ?? null,
    ':extn_id'           => $data['extn_id'] ?? null,
    ':extn_dial_prefix'  => $data['extn_dial_prefix'] ?? null,
    ':tg_mobile_no'      => $data['tg_mobile_no'] ?? null,
]);

    echo json_encode(["success" => true, "message" => "User registered successfully", "id" => $pdo->lastInsertId()]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}