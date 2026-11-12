USE bs_bike_store;

CREATE TABLE IF NOT EXISTS service_appointments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NULL,
  customer_name VARCHAR(120) NOT NULL,
  phone VARCHAR(15) NOT NULL,
  bike VARCHAR(120) NOT NULL,
  service_name VARCHAR(120) NOT NULL,
  service_type VARCHAR(80) NULL,
  scheduled_at DATETIME NOT NULL,
  status ENUM('pending', 'in_progress', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
  observations VARCHAR(500) NOT NULL DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_service_appointments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_service_appointments_user_schedule (user_id, scheduled_at),
  INDEX idx_service_appointments_schedule (scheduled_at, status),
  INDEX idx_service_appointments_status (status, scheduled_at)
);
