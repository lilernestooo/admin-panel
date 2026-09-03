CREATE DATABASE IF NOT EXISTS admin_dashboard CHARACTER SET utf8mb4;
USE admin_dashboard;

CREATE TABLE users (
  rec_id                  INT AUTO_INCREMENT PRIMARY KEY,
  userid                  VARCHAR(40)  NOT NULL,
  user_password           VARCHAR(255) NOT NULL,
  user_employee_id        VARCHAR(6)   DEFAULT NULL,
  user_name               VARCHAR(45)  DEFAULT NULL,
  companyid               VARCHAR(100) DEFAULT NULL,
  user_dealer_group_code  VARCHAR(8)   DEFAULT NULL,
  user_rights             VARCHAR(20)  DEFAULT 'user',
  calendar_folder         VARCHAR(50)  DEFAULT NULL,
  chg_password            VARCHAR(1)   DEFAULT 'Y',
  chg_psswrd_datetime     DATETIME     DEFAULT NULL,
  user_email_address      VARCHAR(60)  DEFAULT NULL,
  user_mobile_no          VARCHAR(13)  DEFAULT NULL,
  last_loggin             DATETIME     DEFAULT NULL,
  chFunction              VARCHAR(45)  DEFAULT NULL,
  extn_id                 VARCHAR(200) DEFAULT NULL,
  extn_dial_prefix        VARCHAR(200) DEFAULT NULL,
  tg_mobile_no            VARCHAR(11)  DEFAULT NULL,
  otp_code                VARCHAR(6)   DEFAULT NULL,
  otp_expires_at          DATETIME     DEFAULT NULL,
  created_at              DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at              DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_userid (userid),
  UNIQUE KEY uq_email (user_email_address)
) ENGINE=InnoDB;