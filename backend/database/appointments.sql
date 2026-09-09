USE admin_dashboard;

CREATE TABLE IF NOT EXISTS appointments (
  appointment_id     INT AUTO_INCREMENT PRIMARY KEY,
  user_rec_id         INT          NOT NULL,
  appointment_date    DATE         NOT NULL,
  appointment_time    TIME         DEFAULT NULL,
  title               VARCHAR(150) NOT NULL,
  notes               TEXT         DEFAULT NULL,
  status              ENUM('scheduled', 'completed', 'cancelled') NOT NULL DEFAULT 'scheduled',
  created_at          DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_appointments_user
    FOREIGN KEY (user_rec_id) REFERENCES users(rec_id)
    ON DELETE CASCADE,
  INDEX idx_appointments_user (user_rec_id),
  INDEX idx_appointments_date (appointment_date)
) ENGINE=InnoDB;