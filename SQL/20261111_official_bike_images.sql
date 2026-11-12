USE bs_bike_store;

UPDATE products
SET image_url = CASE id
  WHEN 7 THEN '/images/bikes/electric-specialized-brown.jpeg'
  WHEN 8 THEN '/images/bikes/electric-specialized-forest.jpeg'
  WHEN 9 THEN '/images/bikes/electric-santa-cruz-purple.jpeg'
  WHEN 10 THEN '/images/bikes/electric-scott-enduro.jpeg'
  WHEN 20 THEN '/images/bikes/electric-santa-cruz-black.jpeg'
  WHEN 11 THEN '/images/bikes/road-canyon-aeroad.jpeg'
  WHEN 12 THEN '/images/bikes/road-pinarello.jpeg'
  WHEN 22 THEN '/images/bikes/road-sworks.jpeg'
  WHEN 23 THEN '/images/bikes/road-trek.jpeg'
  ELSE image_url
END
WHERE id IN (7, 8, 9, 10, 20, 11, 12, 22, 23)
  AND category IN ('Eléctrica', 'Ruta');
