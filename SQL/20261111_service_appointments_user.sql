USE bs_bike_store;

ALTER TABLE service_appointments
  ADD COLUMN user_id BIGINT UNSIGNED NULL AFTER id,
  ADD INDEX idx_service_appointments_user_schedule (user_id, scheduled_at),
  ADD CONSTRAINT fk_service_appointments_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE;
