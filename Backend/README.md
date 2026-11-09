# Backend BS Bike Store

API REST para el catálogo, las cuentas, los pedidos y las reseñas de BS Bike Store. Los precios de los pedidos se calculan en el servidor y el inventario se reserva dentro de una transacción MySQL. El backend no procesa pagos.

## Requisitos

- Node.js 20 o superior
- MySQL 8.0 o superior

## Configuración local

1. Crear la base y las tablas desde la carpeta raíz del proyecto:

   ```sh
   mysql -u root -p < SQL/schema.sql
   ```

   Si ya habías creado la base, aplica también la migración de factura e imágenes:

   ```sh
   mysql -u root -p < SQL/20261008_invoice.sql
   ```

   Para bases existentes, aplica también la migración de consentimiento y clientes:

   ```sh
   mysql -u root -p < SQL/20261022_user_consent_clients.sql
   ```

   En bases existentes creadas antes de que `SQL/schema.sql` incluyera ofertas, crea primero sus tablas:

   ```sh
   mysql -u root -p < SQL/20261022_admin_controls.sql
   ```

   Si la API devuelve un error `Unknown column 'r.product_id'`, actualiza la tabla de reseñas de una base existente:

   ```sh
   mysql -u root -p < SQL/20261106_reviews_product_link.sql
   ```

   Las reseñas existentes se conservan sin asociar a un producto; las nuevas quedarán vinculadas al producto correspondiente.

   Para bases existentes que ya tienen la tabla `offers`, aplica la migración aditiva de ofertas por producto. Si acabas de crear la base desde el `SQL/schema.sql` actual, omite esta migración: ya incluye las columnas y tablas nuevas.

   ```sh
   mysql -u root -p < SQL/20261108_product_offers.sql
   ```

   Conserva los registros y su estado actual, y crea la tabla N:M `offer_products`.

   Para habilitar el agendamiento del taller en una base existente:

   ```sh
   mysql -u root -p < SQL/20261109_service_appointments.sql
   ```

   Una instalación nueva desde `SQL/schema.sql` ya incluye la tabla de citas. La hora se persiste en UTC y se muestra al administrador en la zona horaria del navegador.

   Para habilitar el historial persistente del chat en una base existente:

   ```sh
   mysql -u root -p < SQL/20261109_chat_assistant.sql
   ```

   Una instalación nueva desde `SQL/schema.sql` ya incluye las tablas de conversación. Las solicitudes de asesoría se guardan en la sesión con los datos de contacto proporcionados.

   Para habilitar la lista de deseos persistente en una base existente:

   ```sh
   mysql -u root -p < SQL/20261109_user_wishlist.sql
   ```

   Una instalación nueva desde `SQL/schema.sql` ya incluye `user_wishlist`; cada usuario solo puede consultar y modificar su propia lista.

2. En `Backend/`, instalar dependencias y crear la configuración local:

   ```sh
   npm install
   cp .env.example .env
   ```

3. Completar las credenciales MySQL, `JWT_SECRET` (mínimo 32 caracteres) y `FRONTEND_ORIGIN=http://localhost:8443`.
   En producción, no usar `root`: crea un usuario exclusivo para la aplicación con permisos mínimos y habilita TLS para MySQL (`DB_SSL=true`). Por ejemplo, desde una sesión administrativa de MySQL, reemplaza la contraseña por una secreta y adapta el host a donde corre la API:

   ```sql
   CREATE USER 'bs_app'@'localhost' IDENTIFIED BY 'REEMPLAZAR_POR_UNA_CLAVE_LARGA_Y_UNICA';
   GRANT SELECT, INSERT, UPDATE ON bs_bike_store.* TO 'bs_app'@'localhost';
   GRANT DELETE ON bs_bike_store.offer_products TO 'bs_app'@'localhost';
   GRANT DELETE ON bs_bike_store.user_wishlist TO 'bs_app'@'localhost';
   ```

   Usa ese usuario y clave en `DB_USER` y `DB_PASSWORD`. Mantén las migraciones y tareas administrativas de esquema en una cuenta DBA separada; no concedas `CREATE`, `ALTER`, `DROP` ni `GRANT` al usuario de ejecución. En producción, la API rechaza `root`, contraseña vacía o conexiones sin `DB_SSL=true` y valida los certificados TLS de MySQL.
   Seguridad web en producción: publica el frontend y la API solo detrás de HTTPS. La API entrega JWT exclusivamente en cookie `HttpOnly`, `SameSite=Lax` y `Secure` en producción; las operaciones que modifican datos requieren un `Origin` de confianza y CORS admite credenciales solo desde `FRONTEND_ORIGIN`. El frontend aplica Content Security Policy y cabeceras anti-clickjacking, MIME sniffing y control de permisos en Vite dev/preview; si se sirve el build desde otro hosting, configura esas mismas cabeceras en el servidor o CDN. Conserva `helmet` en la API y limita `FRONTEND_ORIGIN` a los dominios HTTPS de confianza. Mantén MySQL en una red privada, no expongas el puerto 3306 a Internet y conserva copias cifradas con pruebas periódicas de restauración.
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
- `POST /api/orders`, `GET /api/orders/mine`
- `POST /api/appointments` (agendamiento público, con límite de solicitudes); requiere teléfono numérico y una fecha futura.
- `GET /api/orders/:id` (el cliente solo puede consultar sus propios pedidos)
- `POST /api/reviews`
- Usuarios administradores persistentes: `GET/POST /api/admin/users` y `PATCH /api/admin/users/:id/active`.
- Ofertas persistentes: `GET/POST /api/admin/offers`, `PATCH /api/admin/offers/:id`, `PATCH /api/admin/offers/:id/active` y `DELETE /api/admin/offers/:id` (archivo lógico, sin borrar historial); cada oferta debe asociarse a uno o más productos.
- Reseñas habilitables/deshabilitables: `GET /api/admin/reviews?approved=false|true` y `PATCH /api/admin/reviews/:id/approval`.
- Citas de taller (administrador): `GET /api/admin/appointments` y `PATCH /api/admin/appointments/:id/status`; estados `pending`, `in_progress`, `completed` y `cancelled`.
- Administración con token Bearer y rol `admin`: `GET /api/admin/products`, `POST/PATCH /api/products`, `GET/POST /api/admin/clients`, `PATCH /api/admin/clients/:id/active`, `GET /api/orders`, `PATCH /api/orders/:id/status`, `GET /api/admin/reviews?approved=false` y `PATCH /api/admin/reviews/:id/approval`

Para las rutas protegidas, enviar `Authorization: Bearer <token>`. Los estados de pedido aceptados por administración son `processing`, `shipped`, `delivered` y `cancelled`.

Los productos devuelven `img`, `gallery` y `specs`, además de `rating` y `reviews` calculados con reseñas aprobadas. El seed conserva las imágenes locales actuales del frontend; las imágenes agregadas desde administración se almacenan como data URI de hasta 500 KB.

La autenticación usa exclusivamente una cookie JWT HttpOnly; el navegador debe usar `credentials: include`. No envíes contraseñas, JWT ni otras claves en URLs, parámetros de consulta, repositorios, código del frontend o registros. Las contraseñas administrativas se configuran mediante variables de entorno, tienen un mínimo de 12 caracteres y se almacenan con bcrypt. En producción, sirve frontend y API únicamente detrás de HTTPS y conserva las restricciones de origen y cookies seguras descritas arriba.