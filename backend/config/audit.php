<?php
function logAudit($pdo, $action, $performedBy, $targetUserId = null, $targetUserName = null, $details = null) {
    try {
        $stmt = $pdo->prepare("
            INSERT INTO audit_logs (action, performed_by, target_userid, target_user_name, details)
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([$action, $performedBy, $targetUserId, $targetUserName, $details]);
    } catch (PDOException $e) {
        // Never let a logging failure break the actual action being logged
        error_log("Audit log failed: " . $e->getMessage());
    }
}