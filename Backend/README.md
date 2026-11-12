# Backend BS Bike Store

API REST para el catálogo, las cuentas, los pedidos y las reseñas de BS Bike Store. Los precios de los pedidos se calculan en el servidor y el inventario se reserva dentro de una transacción MySQL. El backend no procesa pagos.

## Requisitos

- Node.js 20 o superior
- MySQL 8.0 o superior

## Configuración local

1. Crear la base, las tablas y los datos iniciales desde la carpeta raíz del proyecto, en este orden:

   ```sh
   mysql -u root -p < SQL/schema.sql
   mysql -u root -p < SQL/seed.sql
   ```

   `SQL/schema.sql` crea la base `bs_bike_store` con todas las tablas (usuarios, productos, lista de deseos, carrito, pedidos, facturas, reseñas, ofertas, citas de taller y chat). `SQL/seed.sql` carga el catálogo inicial y es repetible: conserva el stock de los productos que ya existen. Ya no hay migraciones sueltas: para empezar de cero, borra la base y vuelve a ejecutar esos dos archivos.

   En producción, el usuario de ejecución necesita permiso `DELETE` en `offer_products`, `user_wishlist` y `cart_items` (ver el paso 3).
2. En `Backend/`, instalar dependencias y crear la configuración local:

   ```sh
   npm install
   cp .env.example .env
   ```

3. Completar las credenciales MySQL, `JWT_SECRET` (mínimo 32 caracteres) y `FRONTEND_ORIGIN=http://localhost:8443`. En desarrollo, la API también permite orígenes HTTP de la red privada (`10.x.x.x`, `172.16–31.x.x` y `192.168.x.x`) para acceder desde otros dispositivos; en producción solo se permiten los orígenes HTTPS enumerados en `FRONTEND_ORIGIN`, separados por comas.
   En producción, no usar `root`: crea un usuario exclusivo para la aplicación con permisos mínimos y habilita TLS para MySQL (`DB_SSL=true`). Por ejemplo, desde una sesión administrativa de MySQL, reemplaza la contraseña por una secreta y adapta el host a donde corre la API:

   ```sql
   CREATE USER 'bs_app'@'localhost' IDENTIFIED BY 'REEMPLAZAR_POR_UNA_CLAVE_LARGA_Y_UNICA';
   GRANT SELECT, INSERT, UPDATE ON bs_bike_store.* TO 'bs_app'@'localhost';
   GRANT DELETE ON bs_bike_store.offer_products TO 'bs_app'@'localhost';
   GRANT DELETE ON bs_bike_store.user_wishlist TO 'bs_app'@'localhost';
   GRANT DELETE ON bs_bike_store.cart_items TO 'bs_app'@'localhost';
   ```

   Usa ese usuario y clave en `DB_USER` y `DB_PASSWORD`. Mantén las migraciones y tareas administrativas de esquema en una cuenta DBA separada; no concedas `CREATE`, `ALTER`, `DROP` ni `GRANT` al usuario de ejecución. En producción, la API rechaza `root`, contraseña vacía o conexiones sin `DB_SSL=true` y valida los certificados TLS de MySQL.
   Seguridad web en producción: publica el frontend y la API solo detrás de HTTPS. La API entrega JWT exclusivamente en cookie `HttpOnly`, `SameSite=Lax` y `Secure` en producción; las operaciones que modifican datos requieren un `Origin` de confianza y CORS admite credenciales solo desde `FRONTEND_ORIGIN`. El frontend aplica Content Security Policy y cabeceras anti-clickjacking, MIME sniffing y control de permisos en Vite dev/preview; si se sirve el build desde otro hosting, configura esas mismas cabeceras en el servidor o CDN. Conserva `helmet` en la API y limita `FRONTEND_ORIGIN` a los dominios HTTPS de confianza. Mantén MySQL en una red privada, no expongas el puerto 3306 a Internet y conserva copias cifradas con pruebas periódicas de restauración.
   La autenticación utiliza JWT propio en cookie; no utiliza Firebase Auth ni requiere configurar Firebase Authorized Domains.
4. Importar el catálogo inicial. Conserva el stock actual si un producto ya existe:

   ```sh
   npm run catalog:seed
   ```

   Para validar los productos sin conectarse a MySQL, ejecutar `npm run catalog:seed -- --dry-run`.
5. Crear la cuenta administrativa. Define `ADMIN_EMAIL` y `ADMIN_PASSWORD` en el entorno; la contraseña debe tener al menos 12 caracteres:

   ```sh
   npm run admin:create
   ```

6. Iniciar la API:

   ```sh
   npm run dev
   ```

La API queda disponible a través de `http://localhost:8444/api`; Vite la redirige al backend en `http://localhost:4000` para que también funcione desde otros dispositivos conectados a la misma red Wi-Fi. Inicia el frontend con `cd Frontend && npm run dev`; se enlaza a todas las interfaces de red y prefiere el puerto `8444` (o el valor de `PORT`), eligiendo automáticamente el siguiente puerto libre si el preferido ya está ocupado. Para abrirlo desde otro dispositivo, usa la URL que Vite indique al iniciar. Comprueba `/api/health` para verificar la conexión con MySQL.

Al confirmar el checkout se registra el pedido como `processing` (confirmado y en preparación), la factura interna y la salida de inventario en una sola transacción. El pago en efectivo permanece `pending` hasta recibirlo; no se cobra dinero ni se genera una factura electrónica DIAN. El usuario debe iniciar sesión con una cuenta creada en la API. La factura persistida se consulta junto con el pedido mediante `GET /api/orders/:id`.

## Endpoints

> Autenticación: las rutas protegidas usan cookie JWT HttpOnly y requieren `credentials: include`; no envíes JWT en `Authorization` ni lo guardes en `sessionStorage`.

- `GET /api/health`
- `GET /api/products?category=Ruta&minPrice=1000000&maxPrice=5000000&sort=price_asc&page=1&limit=24`
- `GET /api/products/:id` y `GET /api/products/:id/reviews`, `GET /api/reviews?limit=50`
- `POST /api/auth/register` (requiere `termsAccepted: true`), `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`
- `POST /api/chat/message`, `GET /api/chat/history/:sessionId` y `POST /api/chat/escalation`; cada conversación usa un UUID persistido y el historial de una cuenta autenticada solo lo puede leer esa cuenta.
- Carrito de cliente: `GET /api/cart/:userId`, `POST /api/cart` (sincroniza los ítems recibidos como conjunto) y `DELETE /api/cart/:userId/:productId`; solo se permite operar sobre el usuario autenticado.
- `POST /api/orders`, `GET /api/orders/mine`
- `POST /api/appointments` (agendamiento público, con límite de solicitudes); requiere teléfono numérico y una fecha futura.
- `GET /api/orders/:id` (el cliente solo puede consultar sus propios pedidos)
- `POST /api/reviews`
- Usuarios administradores persistentes: `GET/POST /api/admin/users` y `PATCH /api/admin/users/:id/active`.
- Ofertas persistentes: `GET/POST /api/admin/offers`, `PATCH /api/admin/offers/:id`, `PATCH /api/admin/offers/:id/active` y `DELETE /api/admin/offers/:id` (archivo lógico, sin borrar historial); cada oferta debe asociarse a uno o más productos.
- Reseñas habilitables/deshabilitables: `GET /api/admin/reviews?approved=false|true` y `PATCH /api/admin/reviews/:id/approval`.
- Citas de taller (administrador): `GET /api/admin/appointments` y `PATCH /api/admin/appointments/:id/status`; estados `pending`, `in_progress`, `completed` y `cancelled`.
- Historial de compras por cliente (administrador): `GET /api/admin/customers/:userId/orders`.
- Administración con token Bearer y rol `admin`: `GET /api/admin/products`, `POST/PATCH /api/products`, `GET/POST /api/admin/clients`, `PATCH /api/admin/clients/:id/active`, `GET /api/orders`, `PATCH /api/orders/:id/status`, `GET /api/admin/reviews?approved=false` y `PATCH /api/admin/reviews/:id/approval`

Para las rutas protegidas, enviar `Authorization: Bearer <token>`. Los estados de pedido aceptados por administración son `processing`, `shipped`, `delivered` y `cancelled`.

Los productos devuelven `img`, `gallery` y `specs`, además de `rating` y `reviews` calculados con reseñas aprobadas. El seed conserva las imágenes locales actuales del frontend; las imágenes agregadas desde administración se almacenan como data URI de hasta 500 KB.

La autenticación usa exclusivamente una cookie JWT HttpOnly; el navegador debe usar `credentials: include`. No envíes contraseñas, JWT ni otras claves en URLs, parámetros de consulta, repositorios, código del frontend o registros. Las contraseñas administrativas se configuran mediante variables de entorno, tienen un mínimo de 12 caracteres y se almacenan con bcrypt. En producción, sirve frontend y API únicamente detrás de HTTPS y conserva las restricciones de origen y cookies seguras descritas arriba.