-- Run explicitly on the existing MySQL database before enabling payments.
-- Order data is not published. Set a retention policy before going live.
CREATE TABLE IF NOT EXISTS payment_orders (
  session_id VARCHAR(255) PRIMARY KEY,
  payload JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS payment_outbox (
  id VARCHAR(280) PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  kind VARCHAR(20) NOT NULL,
  provider_key CHAR(36) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  attempts INT NOT NULL DEFAULT 0,
  next_attempt_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  first_attempt_at DATETIME NULL,
  lease_until DATETIME NULL,
  completed_at DATETIME NULL,
  last_error VARCHAR(100) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX payment_outbox_ready (status, next_attempt_at),
  FOREIGN KEY (session_id) REFERENCES payment_orders(session_id)
);
