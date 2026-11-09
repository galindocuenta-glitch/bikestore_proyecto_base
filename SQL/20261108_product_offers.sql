USE bs_bike_store;

SET @migration_sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns
   WHERE table_schema = DATABASE() AND table_name = 'offers' AND column_name = 'valid_from') = 0,
  'ALTER TABLE offers ADD COLUMN valid_from DATE NOT NULL DEFAULT ''2000-01-01'' AFTER code',
  'SELECT 1'
);
PREPARE migration_statement FROM @migration_sql;
EXECUTE migration_statement;
DEALLOCATE PREPARE migration_statement;

SET @migration_sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns
   WHERE table_schema = DATABASE() AND table_name = 'offers'
     AND column_name = 'product_id' AND is_nullable = 'NO') > 0,
  'ALTER TABLE offers MODIFY COLUMN product_id BIGINT UNSIGNED NULL',
  'SELECT 1'
);
PREPARE migration_statement FROM @migration_sql;
EXECUTE migration_statement;
DEALLOCATE PREPARE migration_statement;

SET @migration_sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics
   WHERE table_schema = DATABASE() AND table_name = 'offers' AND index_name = 'idx_offers_active_period') = 0,
  'ALTER TABLE offers ADD INDEX idx_offers_active_period (active, valid_from, valid_until)',
  'SELECT 1'
);
PREPARE migration_statement FROM @migration_sql;
EXECUTE migration_statement;
DEALLOCATE PREPARE migration_statement;

SET @migration_sql = IF(
  (SELECT COUNT(*) FROM information_schema.statistics
   WHERE table_schema = DATABASE() AND table_name = 'order_items' AND index_name = 'idx_order_items_product_order') = 0,
  'ALTER TABLE order_items ADD INDEX idx_order_items_product_order (product_id, order_id)',
  'SELECT 1'
);
PREPARE migration_statement FROM @migration_sql;
EXECUTE migration_statement;
DEALLOCATE PREPARE migration_statement;

CREATE TABLE IF NOT EXISTS offer_products (
  offer_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (offer_id, product_id),
  INDEX idx_offer_products_product (product_id, offer_id),
  CONSTRAINT fk_offer_products_offer FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE,
  CONSTRAINT fk_offer_products_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

SET @migration_sql = IF(
  (SELECT COUNT(*) FROM information_schema.columns
   WHERE table_schema = DATABASE() AND table_name = 'offers' AND column_name = 'product_id') > 0,
  'INSERT IGNORE INTO offer_products (offer_id, product_id) SELECT id, product_id FROM offers WHERE product_id IS NOT NULL',
  'SELECT 1'
);
PREPARE migration_statement FROM @migration_sql;
EXECUTE migration_statement;
DEALLOCATE PREPARE migration_statement;
