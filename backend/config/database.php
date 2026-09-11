<?php
// CORS headers, session, and env loading now live in middleware/bootstrap.php.
// This file's only job is producing a DB connection.

class Database {
    private $host;
    private $db_name;
    private $username;
    private $password;
    public $conn;

    public function __construct() {
        // Fail loudly if .env didn't load, instead of silently falling back
        // to 'root'/no-password -- that fallback is fine on your laptop but
        // dangerous if it ever accidentally reaches a real server.
        foreach (['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASS'] as $key) {
            if (!isset($_ENV[$key])) {
                http_response_code(500);
                echo json_encode(["success" => false, "message" => "Server configuration error"]);
                exit();
            }
        }
        $this->host     = $_ENV['DB_HOST'];
        $this->db_name  = $_ENV['DB_NAME'];
        $this->username = $_ENV['DB_USER'];
        $this->password = $_ENV['DB_PASS'];
    }

    public function connect() {
        $this->conn = null;
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4",
                $this->username,
                $this->password,
                [PDO::ATTR_EMULATE_PREPARES => false] // forces real prepared statements
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log("DB connection error: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Could not connect to the database"]);
            exit();
        }
        return $this->conn;
    }
}