USE bs_bike_store;

ALTER TABLE products MODIFY image_url MEDIUMTEXT NULL;

CREATE TABLE IF NOT EXISTS invoices (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL UNIQUE,
  invoice_number VARCHAR(32) NOT NULL UNIQUE,
  subtotal BIGINT UNSIGNED NOT NULL,
  tax_rate DECIMAL(5,2) NOT NULL,
  tax_amount BIGINT UNSIGNED NOT NULL,
  total BIGINT UNSIGNED NOT NULL,
  payment_method ENUM('cash') NOT NULL,
  payment_point ENUM('efecty', 'baloto', 'superpagos', 'tienda') NOT NULL,
  payment_status ENUM('pending', 'paid', 'failed') NOT NULL DEFAULT 'pending',
  billing_name VARCHAR(120) NOT NULL,
  billing_email VARCHAR(190) NOT NULL,
  issued_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_invoices_order FOREIGN KEY (order_id) REFERENCES orders(id),
  INDEX idx_invoices_issued (issued_at)
);