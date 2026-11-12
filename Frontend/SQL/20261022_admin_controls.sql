USE bs_bike_store;

CREATE TABLE IF NOT EXISTS offers (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(120) NOT NULL,
  discount TINYINT UNSIGNED NOT NULL,
  code VARCHAR(40) NOT NULL UNIQUE,
  valid_from DATE NOT NULL DEFAULT '2000-01-01',
  valid_until DATE NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_offers_discount CHECK (discount BETWEEN 1 AND 100),
  INDEX idx_offers_active (active, valid_from, valid_until)
);

CREATE TABLE IF NOT EXISTS offer_products (
  offer_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (offer_id, product_id),
  INDEX idx_offer_products_product (product_id, offer_id),
  CONSTRAINT fk_offer_products_offer FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE,
  CONSTRAINT fk_offer_products_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
