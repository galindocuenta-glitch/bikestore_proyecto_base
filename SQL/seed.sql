-- Semilla de datos de BS Bike Store.
-- Ejecutar DESPUÉS de schema.sql:  mysql -u root -p < SQL/schema.sql  y luego  mysql -u root -p < SQL/seed.sql
-- Es repetible: si el producto ya existe actualiza sus datos pero conserva el stock actual.
-- El administrador NO va aquí (llevaría una contraseña): se crea con  npm run admin:create  desde Backend/.
-- Generada desde ALL_PRODUCTS (Frontend/src/App.tsx): 24 productos.

USE bs_bike_store;

INSERT INTO products (id, name, category, price, stock, description, image_url, gallery, specs, badge, active) VALUES
  (1, 'SANTA CRUZ V10 DH', 'Todo Terreno', 34500000, 8, 'La Santa Cruz V10 DH es una bicicleta de descenso de competición diseñada para ofrecer velocidad, control y estabilidad en los terrenos más exigentes.', NULL, JSON_ARRAY(), JSON_ARRAY(), 'premium', TRUE),
  (2, 'CANYON SENDER CFR', 'Todo Terreno', 25500000, 5, 'La Canyon Sender CFR es una bicicleta de downhill orientada a la competición, creada para mantener precisión y control a alta velocidad.', NULL, JSON_ARRAY(), JSON_ARRAY(), 'Premium', TRUE),
  (3, 'SCOTT GAMBLER TUNED 900', 'Todo Terreno', 29500000, 6, 'La Scott Gambler Tuned 900 es una bicicleta de descenso de alto rendimiento, desarrollada para afrontar circuitos técnicos y grandes impactos.', NULL, JSON_ARRAY(), JSON_ARRAY(), 'Nuevo', TRUE),
  (4, 'SPECIALIZED S-WORKS DEMO', 'Todo Terreno', 36000000, 4, 'La Specialized S-Works Demo es una bicicleta de downhill de nivel profesional, enfocada en la máxima velocidad y respuesta en descenso.', NULL, JSON_ARRAY(), JSON_ARRAY(), 'Aventura', TRUE),
  (5, 'TREK SESSION 9.8', 'Todo Terreno', 23000000, 3, 'La Trek Session 9.8 es una bicicleta de downhill preparada para descensos rápidos, saltos y terrenos técnicos de alta exigencia.', NULL, JSON_ARRAY(), JSON_ARRAY(), 'Top Pick', TRUE),
  (6, 'YT TUES CF CORE 4', 'Todo Terreno', 19600000, 9, 'La YT Tues CF Core 4 es una bicicleta de downhill de alto desempeño, concebida para ofrecer control y confianza en las líneas más agresivas.', NULL, JSON_ARRAY(), JSON_ARRAY(), NULL, TRUE),
  (16, 'COMMENCAL SUPREME DH V5', 'Todo Terreno', 24200000, 5, 'La Commencal Supreme DH V5 es una bicicleta de downhill de competición, desarrollada para mantener velocidad y estabilidad en circuitos exigentes.', NULL, JSON_ARRAY(), JSON_ARRAY(), 'Nuevo', TRUE),
  (17, 'TREK SESSION FACTORY RACING DH', 'Todo Terreno', 23000000, 12, 'La Trek Session Factory Racing DH es una bicicleta de descenso inspirada en la competición, preparada para máxima velocidad y control.', NULL, JSON_ARRAY(), JSON_ARRAY(), NULL, TRUE),
  (18, 'SPECIALIZED ENDURO COMP', 'Todo Terreno', 22200000, 7, 'La Specialized Enduro Comp es una bicicleta de enduro diseñada para combinar eficiencia en ascensos con confianza y control en los descensos.', NULL, JSON_ARRAY(), JSON_ARRAY(), NULL, TRUE),
  (7, 'SPECIALIZED TURBO LEVO COMP', 'Eléctrica', 5900000, 5, 'Bicicleta eléctrica de montaña de doble suspensión, con motor integrado y geometría para senderos técnicos.', '/images/bikes/electric-specialized-brown.jpeg', JSON_ARRAY(), JSON_ARRAY(), 'Más Vendido', TRUE),
  (8, 'SPECIALIZED TURBO LEVO SL', 'Eléctrica', 4800000, 4, 'Bicicleta eléctrica de montaña con doble suspensión, motor visible y configuración orientada al trail.', '/images/bikes/electric-specialized-forest.jpeg', JSON_ARRAY(), JSON_ARRAY(), 'Nuevo', TRUE),
  (9, 'SANTA CRUZ HECKLER SL', 'Eléctrica', 5200000, 7, 'E-MTB Santa Cruz con doble suspensión, motor integrado y cuadro preparado para recorridos de montaña.', '/images/bikes/electric-santa-cruz-purple.jpeg', JSON_ARRAY(), JSON_ARRAY(), NULL, TRUE),
  (10, 'SCOTT PATRON eRIDE', 'Eléctrica', 6500000, 3, 'Bicicleta eléctrica Scott de montaña con doble suspensión, asistencia integrada y componentes para trail.', '/images/bikes/electric-scott-enduro.jpeg', JSON_ARRAY(), JSON_ARRAY(), 'Premium', TRUE),
  (20, 'SANTA CRUZ HECKLER', 'Eléctrica', 4200000, 6, 'E-MTB Santa Cruz de doble suspensión, con motor integrado y montaje diseñado para rutas de montaña.', '/images/bikes/electric-santa-cruz-black.jpeg', JSON_ARRAY(), JSON_ARRAY(), NULL, TRUE),
  (21, 'S-Works Epic FSR World Cup', 'Eléctrica', 3800000, 8, 'La GW Bremen 350W es una opción práctica para la movilidad sostenible. Su motor eléctrico y equipamiento urbano permiten recorrer la ciudad con comodidad y asistencia eficiente.', NULL, JSON_ARRAY(), JSON_ARRAY(), NULL, TRUE),
  (11, 'CANYON AEROAD CFR', 'Ruta', 3490000, 3, 'Bicicleta de ruta aerodinámica Canyon con manillar drop y ruedas de perfil alto, preparada para velocidad en carretera.', '/images/bikes/road-canyon-aeroad.jpeg', JSON_ARRAY(), JSON_ARRAY(), 'Pro Tour', TRUE),
  (12, 'PINARELLO DOGMA F', 'Ruta', 2890000, 5, 'Bicicleta de carretera Pinarello con cuadro aerodinámico, manillar drop y ruedas de alto perfil.', '/images/bikes/road-pinarello.jpeg', JSON_ARRAY(), JSON_ARRAY(), 'Más Vendido', TRUE),
  (22, 'SPECIALIZED S-WORKS TARMAC SL8', 'Ruta', 4100000, 2, 'Bicicleta de carretera S-Works con cuadro aerodinámico, manillar drop y ruedas Roval de perfil alto.', '/images/bikes/road-sworks.jpeg', JSON_ARRAY(), JSON_ARRAY(), 'Top de Gama', TRUE),
  (23, 'TREK MADONE', 'Ruta', 2450000, 7, 'Bicicleta de carretera Trek Madone con cuadro aerodinámico, manillar drop y ruedas Bontrager de perfil alto.', '/images/bikes/road-trek.jpeg', JSON_ARRAY(), JSON_ARRAY(), NULL, TRUE),
  (13, 'GW DANCER 12', 'Infantil', 420000, 14, 'La GW Dancer es la bicicleta infantil más querida de la línea GW. Diseño colorido y alegre, con ruedas de apoyo removibles, frenos de mano de fácil presión y guardabarros para proteger a los pequeños en sus aventuras.', NULL, JSON_ARRAY(), JSON_ARRAY(), 'Más Vendido', TRUE),
  (14, 'JEEP MANASLU 16', 'Infantil', 520000, 10, 'La JEEP Manaslu 16 combina la solidez de la marca JEEP con las necesidades de los pequeños ciclistas. Marco robusto, llantas gruesas para mayor estabilidad y diseño aventurero que emociona a niños y padres.', NULL, JSON_ARRAY(), JSON_ARRAY(), NULL, TRUE),
  (15, 'OPTIMUS SKADI 2 RIN 16', 'Infantil', 680000, 8, 'La Optimus Skadi 2 Rin 16 es una bicicleta infantil ligera y resistente. Sus componentes están pensados para que los niños más activos disfruten de una bicicleta segura y fácil de manejar.', NULL, JSON_ARRAY(), JSON_ARRAY(), 'Premium', TRUE),
  (24, 'GW SHADOW 12', 'Infantil', 380000, 16, 'La GW Shadow es una bicicleta infantil perfecta para los primeros pedales. Con diseño deportivo y colores llamativos, incluye ruedas de apoyo, timbre, reflectores y todo lo que un niño necesita para comenzar a pedalear de manera segura.', NULL, JSON_ARRAY(), JSON_ARRAY(), NULL, TRUE),
  (25, 'JEEP MANASLU 20', 'Infantil', 590000, 9, 'La JEEP Manaslu 20 es el siguiente paso en la línea JEEP infantil. Para niños más grandes que ya pedalean con confianza, con rin de 20 pulgadas, múltiples velocidades y frenos sólidos para mayor independencia.', NULL, JSON_ARRAY(), JSON_ARRAY(), NULL, TRUE)
AS nuevo
ON DUPLICATE KEY UPDATE
  name = nuevo.name,
  category = nuevo.category,
  price = nuevo.price,
  description = nuevo.description,
  image_url = COALESCE(nuevo.image_url, products.image_url),
  badge = nuevo.badge,
  active = TRUE;
