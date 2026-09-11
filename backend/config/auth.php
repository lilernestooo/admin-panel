<?php

// Starts (or resumes) the session with hardened cookie settings.
// Call this at the top of EVERY endpoint that needs to know who's logged in.
function startSecureSession() {
    if (session_status() === PHP_SESSION_NONE) {
        session_set_cookie_params([
            'lifetime' => 0,
            'path'     => '/',
            'domain'   => '',        // set explicitly in production
            'secure'   => true,      // cookie only sent over HTTPS -- set false only for local http dev
            'httponly' => true,      // not accessible to JS, blocks XSS-based cookie theft
            'samesite' => 'Lax',     // use 'None' (with secure=true) if frontend/backend are on different domains
        ]);
        session_start();
    }
}

// Confirms a session exists and belongs to a real logged-in user.
// Returns the session's user_id -- use this instead of trusting request bodies.
function requireAuth() {
    if (empty($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "You must be logged in"]);
        exit();
    }
    return $_SESSION['user_id'];
}

// Confirms the SESSION user (not a client-supplied id) is an admin.
function requireAdmin($pdo) {
    requireAuth();

    if (($_SESSION['user_rights'] ?? null) !== 'admin') {
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "You do not have permission to perform this action"]);
        exit();
    }

    // Defense in depth: re-check against the DB in case rights changed
    // (e.g. an admin was demoted) since this session was created.
    $stmt = $pdo->prepare("SELECT user_rights FROM users WHERE rec_id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $current = $stmt->fetch();

    if (!$current || $current['user_rights'] !== 'admin') {
        session_destroy();
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "Your session is no longer valid. Please log in again."]);
        exit();
    }
}

// Server-side inactivity timeout -- keeps SESSION_TIMEOUT_MS in
// utils/session.js honest rather than just trusted client-side state.
function enforceSessionTimeout() {
    $timeoutSeconds = 8 * 60 * 60; // 8 hours -- keep in sync with the frontend

    if (!empty($_SESSION['user_id'])) {
        if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity']) > $timeoutSeconds) {
            session_unset();
            session_destroy();
            http_response_code(401);
            echo json_encode(["success" => false, "message" => "Session expired. Please log in again."]);
            exit();
        }
        $_SESSION['last_activity'] = time();
    }
}