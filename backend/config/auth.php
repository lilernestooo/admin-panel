<?php
function requireAdmin($pdo, $data) {
    if (empty($data['requester_id'])) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Requester ID is required"]);
        exit();
    }

    $stmt = $pdo->prepare("SELECT user_rights FROM users WHERE userid = ?");
    $stmt->execute([$data['requester_id']]);
    $requester = $stmt->fetch();

    if (!$requester || $requester['user_rights'] !== 'admin') {
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "You do not have permission to perform this action"]);
        exit();
    }
}