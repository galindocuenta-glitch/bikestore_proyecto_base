USE bs_bike_store;

ALTER TABLE reviews
  ADD COLUMN product_id BIGINT UNSIGNED NULL AFTER id,
  DROP INDEX uq_reviews_user_product,
  ADD UNIQUE KEY uq_reviews_user_product (user_id, product_id),
  DROP INDEX idx_reviews_public,
  ADD INDEX idx_reviews_public (product_id, approved, created_at),
  ADD CONSTRAINT fk_reviews_product FOREIGN KEY (product_id) REFERENCES products(id);
