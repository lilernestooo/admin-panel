CREATE TABLE audit_logs (
  log_id            INT AUTO_INCREMENT PRIMARY KEY,
  action            VARCHAR(30)  NOT NULL,
  performed_by      VARCHAR(40)  NOT NULL,
  target_userid     VARCHAR(40)  DEFAULT NULL,
  target_user_name  VARCHAR(45)  DEFAULT NULL,
  details           VARCHAR(255) DEFAULT NULL,
  created_at        DATETIME     DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;