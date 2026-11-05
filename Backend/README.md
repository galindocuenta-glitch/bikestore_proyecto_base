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

   Crea también la tabla de ofertas para el panel administrativo:

   ```sh
   mysql -u root -p < SQL/20261022_admin_controls.sql
   ```

2. En `Backend/`, instalar dependencias y crear la configuración local:

   ```sh
   npm install
   cp .env.example .env
   ```

3. Completar las credenciales MySQL, `JWT_SECRET` (mínimo 32 caracteres) y `FRONTEND_ORIGIN=http://localhost:8443`.
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

La API queda disponible a través de `http://localhost:8444/api`; Vite la redirige al backend en `http://localhost:4000` para que también funcione desde otros dispositivos conectados a la misma red Wi-Fi. Inicia el frontend con `cd Frontend && npm run dev`; se enlaza a todas las interfaces de red y usa exclusivamente el puerto `8444` (falla con un error claro si ya está ocupado). Para abrirlo desde otro dispositivo, usa `http://<IP-local-del-equipo>:8444`. Comprueba `/api/health` para verificar la conexión con MySQL.

Al confirmar el checkout se registra el pedido, la factura interna y la salida de inventario en una sola transacción. El pago en efectivo queda `pending`; no se cobra dinero ni se genera una factura electrónica DIAN. El usuario debe iniciar sesión con una cuenta creada en la API. La factura persistida se consulta junto con el pedido mediante `GET /api/orders/:id`.

## Endpoints

- `GET /api/health`
- `GET /api/products?category=Ruta&minPrice=1000000&maxPrice=5000000&sort=price_asc&page=1&limit=24`
- `GET /api/products/:id` y `GET /api/products/:id/reviews`
- `POST /api/auth/register` (requiere `termsAccepted: true`), `POST /api/auth/login`, `GET /api/auth/me`
- `POST /api/orders`, `GET /api/orders/mine`
- `GET /api/orders/:id` (el cliente solo puede consultar sus propios pedidos)
- `POST /api/reviews`
- Usuarios administradores persistentes: `GET/POST /api/admin/users` y `PATCH /api/admin/users/:id/active`.
- Ofertas persistentes: `GET/POST /api/admin/offers` y `PATCH /api/admin/offers/:id/active`.
- Reseñas habilitables/deshabilitables: `GET /api/admin/reviews?approved=false|true` y `PATCH /api/admin/reviews/:id/approval`.
- Administración con token Bearer y rol `admin`: `GET /api/admin/products`, `POST/PATCH /api/products`, `GET/POST /api/admin/clients`, `PATCH /api/admin/clients/:id/active`, `GET /api/orders`, `PATCH /api/orders/:id/status`, `GET /api/admin/reviews?approved=false` y `PATCH /api/admin/reviews/:id/approval`

Para las rutas protegidas, enviar `Authorization: Bearer <token>`. Los estados de pedido aceptados por administración son `processing`, `shipped`, `delivered` y `cancelled`.

Los productos devuelven `img`, `gallery` y `specs`, además de `rating` y `reviews` calculados con reseñas aprobadas. El seed conserva las imágenes locales actuales del frontend; las imágenes agregadas desde administración se almacenan como data URI de hasta 500 KB.