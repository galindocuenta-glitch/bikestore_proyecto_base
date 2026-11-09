import { Router, type NextFunction, type Request, type Response } from 'express'
import { rateLimit } from 'express-rate-limit'
import bcrypt from 'bcryptjs'
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { z } from 'zod'
import { createToken, optionalAuth, requireAdmin, requireAuth, type AuthUser } from './auth.js'
import { pool } from './db.js'

export const router = Router()

class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

const asyncRoute = (handler: (req: Request, res: Response) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) => {
    void handler(req, res).catch(next)
  }

const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(190),
  password: z.string().min(10).max(72),
  termsAccepted: z.literal(true, { error: 'Debes aceptar los términos y la política de privacidad.' }),
})

const productSchema = z.object({
  name: z.string().trim().min(2).max(180),
  category: z.string().trim().min(2).max(80),
  price: z.number().int().positive(),
  stock: z.number().int().min(0),
  description: z.string().trim().max(5000).default(''),
  imageUrl: z.string().trim().max(900_000).nullable().optional(),
  gallery: z.array(z.string().trim().max(1000)).max(20).default([]),
  specs: z.array(z.object({ label: z.string().trim().max(120), value: z.string().trim().max(300) })).max(40).default([]),
  badge: z.string().trim().max(80).nullable().optional(),
  active: z.boolean().default(true),
})

const orderSchema = z.object({
  items: z.array(z.object({ productId: z.number().int().positive(), quantity: z.number().int().min(1).max(20) })).min(1).max(50),
  paymentMethod: z.literal('cash').default('cash'),
  paymentPoint: z.enum(['efecty', 'baloto', 'superpagos', 'tienda']).default('efecty'),
  shipping: z.object({
    name: z.string().trim().min(2).max(120),
    phone: z.string().trim().min(7).max(30),
    department: z.string().trim().min(2).max(100),
    city: z.string().trim().min(2).max(100),
    address: z.string().trim().min(5).max(240),
    notes: z.string().trim().max(500).optional(),
  }),
})

const reviewSchema = z.object({
  productId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(10).max(2000),
})

const wishlistSchema = z.object({
  productId: z.number().int().positive(),
  action: z.enum(['toggle', 'add']).default('toggle'),
})

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-7', legacyHeaders: false })
const reviewLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 5, standardHeaders: 'draft-7', legacyHeaders: false })
const appointmentLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 10, standardHeaders: 'draft-7', legacyHeaders: false })
const chatLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 40, standardHeaders: 'draft-7', legacyHeaders: false })
const chatSessionIdSchema = z.string().uuid()
const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/api',
}
const activeOfferJoin = `
  LEFT JOIN (
    SELECT product_id, offer_id, offer_title, discount
    FROM (
      SELECT op.product_id, o.id AS offer_id, o.title AS offer_title, o.discount,
        ROW_NUMBER() OVER (PARTITION BY op.product_id ORDER BY o.discount DESC, o.id) AS offer_rank
      FROM offer_products op
      JOIN offers o ON o.id = op.offer_id
      WHERE o.active = 1 AND o.valid_from <= CURRENT_DATE()
        AND (o.valid_until IS NULL OR o.valid_until >= CURRENT_DATE())
    ) ranked_offers
    WHERE offer_rank = 1
  ) active_offer ON active_offer.product_id = p.id
`

router.get('/health', asyncRoute(async (_req, res) => {
  await pool.query('SELECT 1')
  res.json({ status: 'ok', database: 'connected' })
}))

const chatOwnershipError = () => new HttpError(403, 'No tienes acceso a esta conversación.')

async function ensureChatSession(
  connection: Awaited<ReturnType<typeof pool.getConnection>>,
  sessionId: string,
  userId: number | null,
): Promise<void> {
  const [sessions] = await connection.execute<(RowDataPacket & { userId: number | null })[]>(
    'SELECT user_id AS userId FROM chat_sessions WHERE session_id = ? FOR UPDATE',
    [sessionId],
  )
  const session = sessions[0]
  if (!session) {
    await connection.execute(
      'INSERT INTO chat_sessions (session_id, user_id) VALUES (?, ?)',
      [sessionId, userId],
    )
    return
  }
  if (session.userId !== null && session.userId !== userId) throw chatOwnershipError()
  if (session.userId === null && userId !== null) {
    await connection.execute('UPDATE chat_sessions SET user_id = ? WHERE session_id = ?', [userId, sessionId])
  }
}

async function getChatReply(
  connection: Awaited<ReturnType<typeof pool.getConnection>>,
  message: string,
  userId: number | null,
): Promise<{ message: string; offerEscalation: boolean }> {
  const query = message.toLocaleLowerCase('es-CO')
  if (/precio|precios|cu[aá]nto|cuesta|bicicleta|bici/.test(query) && /precio|precios|cu[aá]nto|cuesta/.test(query)) {
    const [products] = await connection.execute<(RowDataPacket & { name: string; price: number; category: string })[]>(
      'SELECT name, price, category FROM products WHERE active = 1 ORDER BY sold_count DESC, name LIMIT 8',
    )
    if (!products.length) return { message: 'Por ahora no hay bicicletas disponibles en el catálogo. ¿Quieres que te comunique con un asesor?', offerEscalation: true }
    const catalog = products.map((product) =>
      `• ${product.name} (${product.category}): $${Number(product.price).toLocaleString('es-CO')} COP`
    ).join('\n')
    return { message: `Estos son algunos productos disponibles y sus precios actuales:\n${catalog}\n\n¿Buscas una bicicleta específica?`, offerEscalation: true }
  }
  if (/pedido|compra|env[ií]o|estado/.test(query)) {
    if (userId === null) {
      return { message: 'Para consultar tus pedidos, inicia sesión y abre “Mis pedidos” desde el menú de tu cuenta. Así protegemos la información de tus compras.', offerEscalation: true }
    }
    const [orders] = await connection.execute<(RowDataPacket & { id: number; status: string; createdAt: string })[]>(
      'SELECT id, status, created_at AS createdAt FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 5',
      [userId],
    )
    if (!orders.length) return { message: 'No encuentro pedidos asociados a tu cuenta todavía. Si necesitas ayuda, puedo avisar a un asesor.', offerEscalation: true }
    const labels: Record<string, string> = {
      pending: 'Pendiente', processing: 'Confirmado · en preparación',
      shipped: 'Enviado', delivered: 'Entregado', cancelled: 'Cancelado',
    }
    const summary = orders.map((order) =>
      `• Pedido #${order.id}: ${labels[order.status] ?? order.status} · ${new Date(order.createdAt).toLocaleDateString('es-CO')}`
    ).join('\n')
    return { message: `Estos son tus pedidos recientes:\n${summary}`, offerEscalation: false }
  }
  if (/taller|mantenimiento|reparaci[oó]n|ensamble|cita|agend/.test(query)) {
    return {
      message: 'En el taller ofrecemos mantenimiento general, ensamble personalizado y reparación. Puedes ver los servicios y solicitar una cita en la sección “Taller y Servicios”.',
      offerEscalation: true,
    }
  }
  if (/repuesto|repuestos|parte|llanta|c[aá]mara|freno|transmisi[oó]n/.test(query)) {
    return {
      message: 'Tenemos repuestos y partes para bicicletas; la compatibilidad depende del modelo y sus componentes. Cuéntame qué bicicleta tienes y qué pieza buscas, o puedo avisar a un asesor.',
      offerEscalation: true,
    }
  }
  if (/pago|pagos|efecty|baloto|superpagos|tienda/.test(query)) {
    return {
      message: 'Actualmente puedes realizar el pago en efectivo mediante Efecty, Baloto, Superpagos o en tienda. El pedido queda confirmado y el pago pendiente hasta recibirlo.',
      offerEscalation: true,
    }
  }
  if (/hola|buenos d[ií]as|buenas tardes|buenas noches/.test(query)) {
    return { message: '¡Hola! Soy el asistente de Bike Store. Puedo ayudarte con bicicletas y precios, pedidos, repuestos, pagos o citas de taller. ¿Qué necesitas?', offerEscalation: false }
  }
  return {
    message: 'Puedo orientarte sobre bicicletas y precios, pedidos, repuestos, pagos y servicios de taller. Si prefieres atención personalizada, puedo enviar tu solicitud a un asesor.',
    offerEscalation: true,
  }
}

const chatMessageSchema = z.object({
  sessionId: chatSessionIdSchema,
  message: z.string().trim().min(1).max(2000),
})

router.post('/chat/message', chatLimiter, optionalAuth, asyncRoute(async (req, res) => {
  const input = chatMessageSchema.parse(req.body)
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    await ensureChatSession(connection, input.sessionId, req.user?.id ?? null)
    const [userResult] = await connection.execute<ResultSetHeader>(
      'INSERT INTO chat_messages (session_id, sender, message) VALUES (?, ?, ?)',
      [input.sessionId, 'user', input.message],
    )
    const reply = await getChatReply(connection, input.message, req.user?.id ?? null)
    const [assistantResult] = await connection.execute<ResultSetHeader>(
      'INSERT INTO chat_messages (session_id, sender, message) VALUES (?, ?, ?)',
      [input.sessionId, 'assistant', reply.message],
    )
    await connection.commit()
    res.status(201).json({
      userMessage: { id: userResult.insertId, sender: 'user', message: input.message, createdAt: new Date().toISOString() },
      assistantMessage: { id: assistantResult.insertId, sender: 'assistant', message: reply.message, createdAt: new Date().toISOString() },
      offerEscalation: reply.offerEscalation,
    })
  } catch (error) {
    try {
      await connection.rollback()
    } catch (rollbackError) {
      console.error('No fue posible revertir la transacción del chat.', rollbackError)
    }
    throw error
  } finally {
    connection.release()
  }
}))

router.get('/chat/history/:sessionId', chatLimiter, optionalAuth, asyncRoute(async (req, res) => {
  const sessionId = chatSessionIdSchema.parse(req.params.sessionId)
  const [sessions] = await pool.execute<(RowDataPacket & { userId: number | null })[]>(
    'SELECT user_id AS userId FROM chat_sessions WHERE session_id = ? LIMIT 1',
    [sessionId],
  )
  const session = sessions[0]
  if (!session) {
    res.json({ items: [] })
    return
  }
  if (session.userId !== null && session.userId !== (req.user?.id ?? null)) throw chatOwnershipError()
  const [messages] = await pool.execute<RowDataPacket[]>(
    `SELECT id, sender, message, created_at AS createdAt
     FROM chat_messages WHERE session_id = ? ORDER BY id DESC LIMIT 200`,
    [sessionId],
  )
  res.json({ items: messages.reverse() })
}))

const chatEscalationSchema = z.object({
  sessionId: chatSessionIdSchema,
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(190),
  phone: z.string().regex(/^\d{7,15}$/),
  request: z.string().trim().min(2).max(1000),
})

router.post('/chat/escalation', chatLimiter, optionalAuth, asyncRoute(async (req, res) => {
  const input = chatEscalationSchema.parse(req.body)
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    await ensureChatSession(connection, input.sessionId, req.user?.id ?? null)
    const userMessage = `Solicitud de asesor: ${input.request}`
    const assistantMessage = 'Tu solicitud fue enviada al equipo de Bike Store. Un asesor se comunicará contigo usando los datos que compartiste.'
    await connection.execute(
      `UPDATE chat_sessions
       SET escalation_requested = 1, contact_name = ?, contact_email = ?, contact_phone = ?, escalation_request = ?
       WHERE session_id = ?`,
      [input.name, input.email.toLowerCase(), input.phone, input.request, input.sessionId],
    )
    await connection.execute(
      'INSERT INTO chat_messages (session_id, sender, message) VALUES (?, ?, ?), (?, ?, ?)',
      [input.sessionId, 'user', userMessage, input.sessionId, 'assistant', assistantMessage],
    )
    await connection.commit()
    res.status(201).json({ message: assistantMessage, createdAt: new Date().toISOString() })
  } catch (error) {
    try {
      await connection.rollback()
    } catch (rollbackError) {
      console.error('No fue posible revertir la solicitud de asesoría.', rollbackError)
    }
    throw error
  } finally {
    connection.release()
  }
}))

const appointmentSchema = z.object({
  customerName: z.string().trim().min(2).max(120),
  phone: z.string().regex(/^\d{7,15}$/, 'El teléfono debe contener entre 7 y 15 dígitos.'),
  bike: z.string().trim().min(2).max(120),
  serviceName: z.string().trim().min(2).max(120),
  serviceType: z.string().trim().max(80).nullable().optional(),
  scheduledAt: z.string().datetime({ offset: true }).refine(
    (value) => Number.isFinite(Date.parse(value)) && Date.parse(value) > Date.now(),
    'La fecha de la cita debe ser futura.',
  ),
  observations: z.string().trim().max(500).default(''),
})

router.post('/appointments', appointmentLimiter, asyncRoute(async (req, res) => {
  const input = appointmentSchema.parse(req.body)
  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO service_appointments (customer_name, phone, bike, service_name, service_type, scheduled_at, observations) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [
      input.customerName,
      input.phone,
      input.bike,
      input.serviceName,
      input.serviceType ?? null,
      new Date(input.scheduledAt).toISOString().slice(0, 19).replace('T', ' '),
      input.observations,
    ],
  )
  res.status(201).json({ id: result.insertId, status: 'pending' })
}))

router.get('/admin/appointments', requireAuth, requireAdmin, asyncRoute(async (_req, res) => {
  const [appointments] = await pool.execute<RowDataPacket[]>(
    `SELECT id, customer_name AS customerName, phone, bike, service_name AS serviceName,
      service_type AS serviceType, DATE_FORMAT(scheduled_at, '%Y-%m-%d %H:%i') AS scheduledAt,
      status, observations, created_at AS createdAt
     FROM service_appointments ORDER BY scheduled_at DESC, id DESC LIMIT 500`,
  )
  res.json({ items: appointments })
}))

router.patch('/admin/appointments/:id/status', requireAuth, requireAdmin, asyncRoute(async (req, res) => {
  const id = z.coerce.number().int().positive().parse(req.params.id)
  const { status } = z.object({ status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']) }).parse(req.body)
  const [appointments] = await pool.execute<(RowDataPacket & { id: number })[]>(
    'SELECT id FROM service_appointments WHERE id = ? LIMIT 1',
    [id],
  )
  if (!appointments.length) throw new HttpError(404, 'No encontramos esa cita.')
  await pool.execute(
    'UPDATE service_appointments SET status = ? WHERE id = ?',
    [status, id],
  )
  res.json({ id, status })
}))

router.post('/auth/register', loginLimiter, asyncRoute(async (req, res) => {
  const input = registerSchema.parse(req.body)
  const passwordHash = await bcrypt.hash(input.password, 12)
  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO users (name, email, password_hash, terms_accepted_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
    [input.name, input.email.toLowerCase(), passwordHash],
  )
  const user: AuthUser = { id: result.insertId, name: input.name, email: input.email.toLowerCase(), role: 'client' }
  res.cookie('bs-bike-store-session', createToken(user), sessionCookieOptions)
  res.status(201).json({ user })
}))

router.post('/auth/login', loginLimiter, asyncRoute(async (req, res) => {
  const input = z.object({ email: z.string().email(), password: z.string().min(1).max(72) }).parse(req.body)
  const [rows] = await pool.execute<(RowDataPacket & { id: number; name: string; email: string; role: AuthUser['role']; password_hash: string; active: boolean })[]>(
    'SELECT id, name, email, role, password_hash, active FROM users WHERE email = ? LIMIT 1',
    [input.email.toLowerCase()],
  )
  const account = rows[0]
  if (!account || !(await bcrypt.compare(input.password, account.password_hash))) {
    throw new HttpError(401, 'Correo o contraseña incorrectos.')
  }
  if (!account.active) throw new HttpError(403, 'Esta cuenta está deshabilitada.')
  const user: AuthUser = { id: account.id, name: account.name, email: account.email, role: account.role }
  res.cookie('bs-bike-store-session', createToken(user), sessionCookieOptions)
  res.json({ user })
}))

router.get('/auth/me', requireAuth, (req, res) => res.json({ user: req.user }))
router.post('/auth/logout', (_req, res) => {
  res.clearCookie('bs-bike-store-session', sessionCookieOptions)
  res.status(204).end()
})

router.get('/wishlist/:userId', requireAuth, asyncRoute(async (req, res) => {
  const userId = z.coerce.number().int().positive().parse(req.params.userId)
  const sessionUser = req.user
  if (!sessionUser || userId !== sessionUser.id) throw new HttpError(403, 'No tienes acceso a esta lista de deseos.')
  const [items] = await pool.execute<RowDataPacket[]>(
    `SELECT p.id, p.name, p.category, p.price AS originalPrice,
      COALESCE(ROUND(p.price * (100 - COALESCE(active_offer.discount, 0)) / 100), p.price) AS price,
      active_offer.offer_id AS offerId, active_offer.offer_title AS offerTitle,
      active_offer.discount AS offerDiscount, p.stock, p.description, p.image_url AS img,
      p.gallery, p.specs, p.badge, p.sold_count AS soldCount,
      COALESCE((SELECT ROUND(AVG(r.rating), 1) FROM reviews r WHERE r.product_id = p.id AND r.approved = 1), 0) AS rating,
      (SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id AND r.approved = 1) AS reviews,
      p.created_at AS createdAt
     FROM user_wishlist w
     JOIN products p ON p.id = w.product_id
     ${activeOfferJoin}
     WHERE w.user_id = ? AND p.active = 1
     ORDER BY w.created_at DESC`,
    [userId],
  )
  res.json({ items })
}))

router.post('/wishlist', requireAuth, asyncRoute(async (req, res) => {
  const { productId, action } = wishlistSchema.parse(req.body)
  const userId = req.user?.id
  if (!userId) throw new HttpError(401, 'Debes iniciar sesión para continuar.')
  const [products] = await pool.execute<RowDataPacket[]>(
    'SELECT id FROM products WHERE id = ? AND active = 1 LIMIT 1',
    [productId],
  )
  if (!products.length) throw new HttpError(404, 'No encontramos ese producto disponible.')

  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const [users] = await connection.execute<RowDataPacket[]>(
      'SELECT id FROM users WHERE id = ? FOR UPDATE',
      [userId],
    )
    if (!users.length) throw new HttpError(401, 'La cuenta ya no está disponible.')

    let saved = true
    if (action === 'add') {
      await connection.execute(
        'INSERT IGNORE INTO user_wishlist (user_id, product_id) VALUES (?, ?)',
        [userId, productId],
      )
    } else {
      const [existingItems] = await connection.execute<RowDataPacket[]>(
        'SELECT id FROM user_wishlist WHERE user_id = ? AND product_id = ? LIMIT 1',
        [userId, productId],
      )
      saved = existingItems.length === 0
      if (saved) {
        await connection.execute(
          'INSERT INTO user_wishlist (user_id, product_id) VALUES (?, ?)',
          [userId, productId],
        )
      } else {
        await connection.execute(
          'DELETE FROM user_wishlist WHERE user_id = ? AND product_id = ?',
          [userId, productId],
        )
      }
    }

    await connection.commit()
    res.json({ productId, saved })
  } catch (error) {
    try {
      await connection.rollback()
    } catch (rollbackError) {
      console.error('No fue posible revertir la operación de lista de deseos.', rollbackError)
    }
    throw error
  } finally {
    connection.release()
  }
}))

router.delete('/wishlist/:userId/:productId', requireAuth, asyncRoute(async (req, res) => {
  const userId = z.coerce.number().int().positive().parse(req.params.userId)
  const productId = z.coerce.number().int().positive().parse(req.params.productId)
  const sessionUser = req.user
  if (!sessionUser || userId !== sessionUser.id) throw new HttpError(403, 'No tienes acceso a esta lista de deseos.')

  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    await connection.execute<RowDataPacket[]>(
      'SELECT id FROM users WHERE id = ? FOR UPDATE',
      [userId],
    )
    await connection.execute(
      'DELETE FROM user_wishlist WHERE user_id = ? AND product_id = ?',
      [userId, productId],
    )
    await connection.commit()
    res.status(204).end()
  } catch (error) {
    try {
      await connection.rollback()
    } catch (rollbackError) {
      console.error('No fue posible revertir la eliminación de lista de deseos.', rollbackError)
    }
    throw error
  } finally {
    connection.release()
  }
}))

router.get('/admin/users', requireAuth, requireAdmin, asyncRoute(async (_req, res) => {
  const [users] = await pool.execute<RowDataPacket[]>(
    "SELECT id, name, email, role, DATE_FORMAT(created_at, '%Y-%m-%d') AS createdAt, active FROM users WHERE role = 'admin' ORDER BY created_at DESC LIMIT 200",
  )
  res.json({ items: users })
}))

router.post('/admin/users', requireAuth, requireAdmin, asyncRoute(async (req, res) => {
  const input = z.object({
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(190),
    password: z.string().min(12).max(72),
  }).parse(req.body)
  const passwordHash = await bcrypt.hash(input.password, 12)
  const [result] = await pool.execute<ResultSetHeader>(
    "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'admin')",
    [input.name, input.email.toLowerCase(), passwordHash],
  )
  res.status(201).json({
    id: result.insertId,
    name: input.name,
    email: input.email.toLowerCase(),
    role: 'admin',
    createdAt: new Date().toISOString().slice(0, 10),
    active: true,
  })
}))

router.patch('/admin/users/:id/active', requireAuth, requireAdmin, asyncRoute(async (req, res) => {
  const id = z.coerce.number().int().positive().parse(req.params.id)
  const { active } = z.object({ active: z.boolean() }).parse(req.body)
  if (!active && id === req.user!.id) throw new HttpError(409, 'No puedes deshabilitar tu propia cuenta.')
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    if (!active) {
      const [admins] = await connection.execute<(RowDataPacket & { id: number })[]>(
        "SELECT id FROM users WHERE role = 'admin' AND active = 1 FOR UPDATE",
      )
      if (admins.length <= 1) throw new HttpError(409, 'Debe permanecer al menos un administrador habilitado.')
    }
    const [result] = await connection.execute<ResultSetHeader>(
      "UPDATE users SET active = ? WHERE id = ? AND role = 'admin'",
      [active, id],
    )
    if (!result.affectedRows) throw new HttpError(404, 'No encontramos ese usuario.')
    await connection.commit()
    res.json({ id, active })
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}))

router.get('/admin/clients', requireAuth, requireAdmin, asyncRoute(async (_req, res) => {
  const [clients] = await pool.execute<RowDataPacket[]>(
    `SELECT u.id, u.name, u.email, COALESCE(u.phone, '') AS phone, u.active,
      COUNT(o.id) AS orders, COALESCE(SUM(o.total), 0) AS totalSpent,
      MAX(o.created_at) AS lastOrder
     FROM users u LEFT JOIN orders o ON o.user_id = u.id
     WHERE u.role = 'client'
     GROUP BY u.id, u.name, u.email, u.phone, u.active
     ORDER BY u.created_at DESC LIMIT 500`,
  )
  res.json({ items: clients })
}))

router.get('/admin/dashboard', requireAuth, requireAdmin, asyncRoute(async (req, res) => {
  const { limit } = z.object({
    limit: z.coerce.number().int().min(1).max(10).default(5),
  }).parse(req.query)

  try {
    const [metricRows] = await pool.execute<(RowDataPacket & {
      totalRevenue: number | null;
      pendingOrders: number | null;
      criticalProducts: number | null;
      totalClients: number | null;
    })[]>(`
      SELECT
        COALESCE((SELECT SUM(total) FROM orders WHERE status != 'cancelled'), 0) AS totalRevenue,
        COALESCE((SELECT COUNT(*) FROM orders WHERE status = 'pending'), 0) AS pendingOrders,
        COALESCE((SELECT COUNT(*) FROM products WHERE active = 1 AND stock <= 5), 0) AS criticalProducts,
        COALESCE((SELECT COUNT(*) FROM users WHERE role = 'client' AND active = 1), 0) AS totalClients
    `)

    const [recentRows] = await pool.execute<RowDataPacket[]>(`
      SELECT
        u.id,
        u.name,
        u.email,
        MAX(o.created_at) AS lastOrderAt,
        COUNT(o.id) AS orders
      FROM users u
      LEFT JOIN orders o ON o.user_id = u.id
      WHERE u.role = 'client' AND u.active = 1
      GROUP BY u.id, u.name, u.email
      ORDER BY MAX(o.created_at) DESC, u.created_at DESC
      LIMIT ?
    `, [limit])

    const metrics = metricRows[0] ?? {
      totalRevenue: 0,
      pendingOrders: 0,
      criticalProducts: 0,
      totalClients: 0,
    }

    res.json({
      metrics: {
        totalRevenue: Number(metrics.totalRevenue ?? 0),
        pendingOrders: Number(metrics.pendingOrders ?? 0),
        criticalProducts: Number(metrics.criticalProducts ?? 0),
        totalClients: Number(metrics.totalClients ?? 0),
      },
      recentClients: recentRows.map((row) => ({
        id: Number(row.id),
        name: String(row.name ?? ''),
        email: String(row.email ?? ''),
        lastOrderAt: row.lastOrderAt ? new Date(String(row.lastOrderAt)).toISOString() : null,
        orders: Number(row.orders ?? 0),
      })),
    })
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error) {
      const code = String((error as { code?: string }).code ?? '')
      if (['ECONNRESET', 'PROTOCOL_CONNECTION_LOST', 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR', 'ETIMEDOUT'].includes(code)) {
        throw new HttpError(503, 'La base de datos no está disponible en este momento.')
      }
    }
    throw error
  }
}))

router.post('/admin/clients', requireAuth, requireAdmin, asyncRoute(async (req, res) => {
  const client = z.object({
    name: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(190),
    password: z.string().min(10).max(72),
    phone: z.string().trim().min(7).max(30),
    termsAccepted: z.literal(true, { error: 'Debes registrar la aceptación de términos y privacidad.' }),
  }).parse(req.body)
  const passwordHash = await bcrypt.hash(client.password, 12)
  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO users (name, email, password_hash, phone, terms_accepted_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
    [client.name, client.email.toLowerCase(), passwordHash, client.phone],
  )
  res.status(201).json({
    id: result.insertId,
    name: client.name,
    email: client.email.toLowerCase(),
    phone: client.phone,
    active: true,
    orders: 0,
    totalSpent: 0,
    lastOrder: null,
  })
}))

router.patch('/admin/clients/:id/active', requireAuth, requireAdmin, asyncRoute(async (req, res) => {
  const id = z.coerce.number().int().positive().parse(req.params.id)
  const { active } = z.object({ active: z.boolean() }).parse(req.body)
  const [result] = await pool.execute<ResultSetHeader>(
    "UPDATE users SET active = ? WHERE id = ? AND role = 'client'",
    [active, id],
  )
  if (!result.affectedRows) throw new HttpError(404, 'No encontramos ese cliente.')
  res.json({ id, active })
}))

router.get('/admin/offers', requireAuth, requireAdmin, asyncRoute(async (_req, res) => {
  const [offers] = await pool.execute<RowDataPacket[]>(
    `SELECT id, title, discount, code,
      DATE_FORMAT(valid_from, '%Y-%m-%d') AS validFrom,
      DATE_FORMAT(valid_until, '%Y-%m-%d') AS validUntil, active,
      COALESCE((SELECT JSON_ARRAYAGG(op.product_id) FROM offer_products op WHERE op.offer_id = offers.id), JSON_ARRAY()) AS productIds
     FROM offers ORDER BY created_at DESC LIMIT 200`,
  )
  res.json({ items: offers })
}))

const offerSchema = z.object({
  title: z.string().trim().min(2).max(120),
  discount: z.number().int().min(1).max(100),
  code: z.string().trim().min(2).max(40).transform((code) => code.toUpperCase()),
  validFrom: z.iso.date(),
  validUntil: z.union([z.iso.date(), z.literal('')]).optional(),
  productIds: z.array(z.number().int().positive()).min(1).max(500)
    .refine((ids) => new Set(ids).size === ids.length, 'No repitas productos en una oferta.'),
}).superRefine((offer, context) => {
  if (offer.validUntil && offer.validUntil < offer.validFrom) {
    context.addIssue({ code: 'custom', path: ['validUntil'], message: 'La fecha final debe ser igual o posterior a la inicial.' })
  }
})

async function validateOfferProducts(productIds: number[], connection: Awaited<ReturnType<typeof pool.getConnection>>): Promise<void> {
  const placeholders = productIds.map(() => '?').join(', ')
  const [products] = await connection.execute<(RowDataPacket & { id: number })[]>(
    `SELECT id FROM products WHERE id IN (${placeholders})`,
    productIds,
  )
  if (products.length !== productIds.length) throw new HttpError(400, 'Uno o más productos de la oferta no existen.')
}

router.post('/admin/offers', requireAuth, requireAdmin, asyncRoute(async (req, res) => {
  const offer = offerSchema.parse(req.body)
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    await validateOfferProducts(offer.productIds, connection)
    const [result] = await connection.execute<ResultSetHeader>(
      'INSERT INTO offers (title, discount, code, valid_from, valid_until) VALUES (?, ?, ?, ?, ?)',
      [offer.title, offer.discount, offer.code, offer.validFrom, offer.validUntil || null],
    )
    for (const productId of offer.productIds) {
      await connection.execute('INSERT INTO offer_products (offer_id, product_id) VALUES (?, ?)', [result.insertId, productId])
    }
    await connection.commit()
    res.status(201).json({ id: result.insertId, ...offer, validUntil: offer.validUntil || '', active: true })
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}))

router.patch('/admin/offers/:id', requireAuth, requireAdmin, asyncRoute(async (req, res) => {
  const id = z.coerce.number().int().positive().parse(req.params.id)
  const offer = offerSchema.parse(req.body)
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    await validateOfferProducts(offer.productIds, connection)
    const [existingOffers] = await connection.execute<(RowDataPacket & { active: number })[]>(
      'SELECT active FROM offers WHERE id = ? FOR UPDATE',
      [id],
    )
    const existingOffer = existingOffers[0]
    if (!existingOffer) throw new HttpError(404, 'No encontramos esa oferta.')
    await connection.execute<ResultSetHeader>(
      'UPDATE offers SET title = ?, discount = ?, code = ?, valid_from = ?, valid_until = ? WHERE id = ?',
      [offer.title, offer.discount, offer.code, offer.validFrom, offer.validUntil || null, id],
    )
    await connection.execute('DELETE FROM offer_products WHERE offer_id = ?', [id])
    for (const productId of offer.productIds) {
      await connection.execute('INSERT INTO offer_products (offer_id, product_id) VALUES (?, ?)', [id, productId])
    }
    await connection.commit()
    res.json({ id, ...offer, validUntil: offer.validUntil || '', active: Boolean(existingOffer.active) })
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}))

router.patch('/admin/offers/:id/active', requireAuth, requireAdmin, asyncRoute(async (req, res) => {
  const id = z.coerce.number().int().positive().parse(req.params.id)
  const { active } = z.object({ active: z.boolean() }).parse(req.body)
  const [result] = await pool.execute<ResultSetHeader>('UPDATE offers SET active = ? WHERE id = ?', [active, id])
  if (!result.affectedRows) throw new HttpError(404, 'No encontramos esa oferta.')
  res.json({ id, active })
}))

router.delete('/admin/offers/:id', requireAuth, requireAdmin, asyncRoute(async (req, res) => {
  const id = z.coerce.number().int().positive().parse(req.params.id)
  const [result] = await pool.execute<ResultSetHeader>('UPDATE offers SET active = 0 WHERE id = ?', [id])
  if (!result.affectedRows) throw new HttpError(404, 'No encontramos esa oferta.')
  res.status(204).end()
}))

router.get('/products', asyncRoute(async (req, res) => {
  const querySchema = z.object({
    category: z.string().trim().max(80).optional(),
    search: z.string().trim().max(120).optional(),
    minPrice: z.coerce.number().int().min(0).optional(),
    maxPrice: z.coerce.number().int().min(0).optional(),
    sort: z.enum(['relevance', 'price_asc', 'price_desc', 'newest', 'popular']).default('relevance'),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(24),
  }).parse(req.query)
  const conditions = ['p.active = 1']
  const values: (string | number)[] = []
  if (querySchema.category && querySchema.category !== 'Todas') {
    conditions.push('p.category = ?')
    values.push(querySchema.category)
  }
  if (querySchema.search) {
    conditions.push('(p.name LIKE ? OR p.description LIKE ?)')
    values.push(`%${querySchema.search}%`, `%${querySchema.search}%`)
  }
  const effectivePrice = 'COALESCE(ROUND(p.price * (100 - COALESCE(active_offer.discount, 0)) / 100), p.price)'
  if (querySchema.minPrice !== undefined) { conditions.push(`${effectivePrice} >= ?`); values.push(querySchema.minPrice) }
  if (querySchema.maxPrice !== undefined) { conditions.push(`${effectivePrice} <= ?`); values.push(querySchema.maxPrice) }
  const orderBy = {
    relevance: 'p.created_at DESC',
    price_asc: `${effectivePrice} ASC`,
    price_desc: `${effectivePrice} DESC`,
    newest: 'p.created_at DESC',
    popular: 'p.sold_count DESC, p.created_at DESC',
  }[querySchema.sort]
  const where = conditions.join(' AND ')
  const offset = (querySchema.page - 1) * querySchema.limit
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT p.id, p.name, p.category, p.price AS originalPrice,
      ${effectivePrice} AS price, active_offer.offer_id AS offerId,
      active_offer.offer_title AS offerTitle, active_offer.discount AS offerDiscount,
      p.stock, p.description, p.image_url AS img, p.gallery, p.specs, p.badge,
      p.sold_count AS soldCount,
      COALESCE((SELECT ROUND(AVG(r.rating), 1) FROM reviews r WHERE r.product_id = p.id AND r.approved = 1), 0) AS rating,
      (SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id AND r.approved = 1) AS reviews,
      p.created_at AS createdAt
     FROM products p ${activeOfferJoin}
     WHERE ${where} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
    [...values, querySchema.limit, offset],
  )
  const [countRows] = await pool.execute<(RowDataPacket & { total: number })[]>(
    `SELECT COUNT(*) AS total FROM products p ${activeOfferJoin} WHERE ${where}`,
    values,
  )
  res.json({ items: rows, page: querySchema.page, limit: querySchema.limit, total: countRows[0].total })
}))

router.get('/products/:id', asyncRoute(async (req, res) => {
  const id = z.coerce.number().int().positive().parse(req.params.id)
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT p.id, p.name, p.category, p.price AS originalPrice,
      COALESCE(ROUND(p.price * (100 - COALESCE(active_offer.discount, 0)) / 100), p.price) AS price,
      active_offer.offer_id AS offerId, active_offer.offer_title AS offerTitle,
      active_offer.discount AS offerDiscount, p.stock, p.description, p.image_url AS img,
      p.gallery, p.specs, p.badge, p.sold_count AS soldCount,
      COALESCE((SELECT ROUND(AVG(r.rating), 1) FROM reviews r WHERE r.product_id = p.id AND r.approved = 1), 0) AS rating,
      (SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id AND r.approved = 1) AS reviews,
      p.created_at AS createdAt
     FROM products p ${activeOfferJoin} WHERE p.id = ? AND p.active = 1 LIMIT 1`,
    [id],
  )
  if (!rows[0]) throw new HttpError(404, 'No encontramos ese producto.')
  res.json(rows[0])
}))

router.post('/products', requireAuth, requireAdmin, asyncRoute(async (req, res) => {
  const product = productSchema.parse(req.body)
  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO products (name, category, price, stock, description, image_url, gallery, specs, badge, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [product.name, product.category, product.price, product.stock, product.description, product.imageUrl ?? null, JSON.stringify(product.gallery), JSON.stringify(product.specs), product.badge ?? null, product.active],
  )
  res.status(201).json({ id: result.insertId, ...product })
}))

router.patch('/products/:id', requireAuth, requireAdmin, asyncRoute(async (req, res) => {
  const id = z.coerce.number().int().positive().parse(req.params.id)
  const patch = productSchema.partial().parse(req.body)
  const columns: Record<string, string> = {
    name: 'name', category: 'category', price: 'price', stock: 'stock', description: 'description',
    imageUrl: 'image_url', gallery: 'gallery', specs: 'specs', badge: 'badge', active: 'active',
  }
  const entries = Object.entries(patch)
  if (!entries.length) throw new HttpError(400, 'Debes enviar al menos un campo para actualizar.')
  const assignments = entries.map(([key]) => `\`${columns[key]}\` = ?`).join(', ')
  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE products SET ${assignments} WHERE id = ?`,
    [...entries.map(([key, value]) => key === 'gallery' || key === 'specs' ? JSON.stringify(value) : value), id],
  )
  if (!result.affectedRows) throw new HttpError(404, 'No encontramos ese producto.')
  res.json({ id, ...patch })
}))

router.delete('/products/:id', requireAuth, requireAdmin, asyncRoute(async (req, res) => {
  const id = z.coerce.number().int().positive().parse(req.params.id)
  const [result] = await pool.execute<ResultSetHeader>('UPDATE products SET active = 0 WHERE id = ?', [id])
  if (!result.affectedRows) throw new HttpError(404, 'No encontramos ese producto.')
  res.status(204).end()
}))

router.get('/admin/products', requireAuth, requireAdmin, asyncRoute(async (_req, res) => {
  const [products] = await pool.execute<RowDataPacket[]>(
    'SELECT p.id, p.name, p.category, p.price, p.stock, p.description, p.image_url AS img, p.gallery, p.specs, p.badge, p.active, p.sold_count AS soldCount, COALESCE((SELECT ROUND(AVG(r.rating), 1) FROM reviews r WHERE r.product_id = p.id AND r.approved = 1), 0) AS rating, (SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id AND r.approved = 1) AS reviews FROM products p ORDER BY p.created_at DESC LIMIT 100',
  )
  res.json({ items: products })
}))

router.post('/orders', requireAuth, asyncRoute(async (req, res) => {
  const input = orderSchema.parse(req.body)
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const quantities = new Map<number, number>()
    for (const item of input.items) {
      quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity)
    }
    const normalizedItems = [...quantities].map(([productId, quantity]) => ({ productId, quantity })).sort((a, b) => a.productId - b.productId)
    if (normalizedItems.some((item) => item.quantity > 20)) throw new HttpError(400, 'La cantidad máxima por producto es 20.')
    const orderItems: { productId: number; name: string; unitPrice: number; quantity: number }[] = []
    let subtotal = 0
    for (const item of normalizedItems) {
      const [rows] = await connection.execute<(RowDataPacket & { id: number; name: string; price: number; stock: number })[]>(
        'SELECT id, name, price, stock FROM products WHERE id = ? AND active = 1 FOR UPDATE',
        [item.productId],
      )
      const product = rows[0]
      if (!product) throw new HttpError(400, `El producto ${item.productId} ya no está disponible.`)
      if (product.stock < item.quantity) throw new HttpError(409, `Inventario insuficiente para ${product.name}.`)
      const [offers] = await connection.execute<(RowDataPacket & { discount: number })[]>(
        `SELECT o.discount FROM offer_products op
         JOIN offers o ON o.id = op.offer_id
         WHERE op.product_id = ? AND o.active = 1 AND o.valid_from <= CURRENT_DATE()
           AND (o.valid_until IS NULL OR o.valid_until >= CURRENT_DATE())
         ORDER BY o.discount DESC, o.id LIMIT 1 FOR SHARE`,
        [product.id],
      )
      const discount = Number(offers[0]?.discount ?? 0)
      const unitPrice = Math.round(Number(product.price) * (100 - discount) / 100)
      orderItems.push({ productId: product.id, name: product.name, unitPrice, quantity: item.quantity })
      subtotal += unitPrice * item.quantity
    }
    const taxRate = 19
    const taxAmount = Math.round(subtotal * taxRate / 100)
    const total = subtotal + taxAmount
    const [orderResult] = await connection.execute<ResultSetHeader>(
      "INSERT INTO orders (user_id, status, total, shipping_name, shipping_phone, shipping_department, shipping_city, shipping_address, shipping_notes) VALUES (?, 'processing', ?, ?, ?, ?, ?, ?, ?)",
      [req.user!.id, total, input.shipping.name, input.shipping.phone, input.shipping.department, input.shipping.city, input.shipping.address, input.shipping.notes ?? null],
    )
    const invoiceNumber = `BS-${new Date().getFullYear()}-${String(orderResult.insertId).padStart(8, '0')}`
    for (const item of orderItems) {
      await connection.execute(
        'INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity) VALUES (?, ?, ?, ?, ?)',
        [orderResult.insertId, item.productId, item.name, item.unitPrice, item.quantity],
      )
      await connection.execute('UPDATE products SET stock = stock - ?, sold_count = sold_count + ? WHERE id = ?', [item.quantity, item.quantity, item.productId])
    }
    await connection.execute(
      'INSERT INTO invoices (order_id, invoice_number, subtotal, tax_rate, tax_amount, total, payment_method, payment_point, payment_status, billing_name, billing_email) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [orderResult.insertId, invoiceNumber, subtotal, taxRate, taxAmount, total, input.paymentMethod, input.paymentPoint, 'pending', req.user!.name, req.user!.email],
    )
    await connection.commit()
    res.status(201).json({
      id: orderResult.insertId,
      status: 'processing',
      items: orderItems,
      invoice: {
        number: invoiceNumber,
        subtotal,
        taxRate,
        taxAmount,
        total,
        paymentMethod: 'cash',
        paymentPoint: input.paymentPoint,
        paymentStatus: 'pending',
        billingName: req.user!.name,
        billingEmail: req.user!.email,
        issuedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}))

router.get('/orders/mine', requireAuth, asyncRoute(async (req, res) => {
  const [orders] = await pool.execute<RowDataPacket[]>(
    `SELECT o.id, o.status, o.total, o.created_at AS createdAt,
      i.invoice_number AS invoiceNumber, i.subtotal, i.tax_rate AS taxRate,
      i.tax_amount AS taxAmount, i.payment_method AS paymentMethod,
      i.payment_point AS paymentPoint, i.payment_status AS paymentStatus,
      i.issued_at AS issuedAt,
      COALESCE((SELECT JSON_ARRAYAGG(JSON_OBJECT(
        'productId', oi.product_id, 'name', oi.product_name,
        'unitPrice', oi.unit_price, 'quantity', oi.quantity
      )) FROM order_items oi WHERE oi.order_id = o.id), JSON_ARRAY()) AS items
     FROM orders o LEFT JOIN invoices i ON i.order_id = o.id
     WHERE o.user_id = ? ORDER BY o.created_at DESC`,
    [req.user!.id],
  )
  res.json(orders)
}))

router.get('/orders/:id', requireAuth, asyncRoute(async (req, res) => {
  const id = z.coerce.number().int().positive().parse(req.params.id)
  const [orders] = await pool.execute<(RowDataPacket & { userId: number })[]>(
    'SELECT id, user_id AS userId, status, total, shipping_name AS shippingName, shipping_phone AS shippingPhone, shipping_department AS department, shipping_city AS city, shipping_address AS address, shipping_notes AS notes, created_at AS createdAt FROM orders WHERE id = ? LIMIT 1',
    [id],
  )
  const order = orders[0]
  if (!order) throw new HttpError(404, 'No encontramos ese pedido.')
  if (order.userId !== req.user!.id && req.user!.role !== 'admin') throw new HttpError(403, 'No tienes acceso a este pedido.')
  const [items] = await pool.execute<RowDataPacket[]>(
    'SELECT product_id AS productId, product_name AS name, unit_price AS unitPrice, quantity FROM order_items WHERE order_id = ?',
    [id],
  )
  const [invoices] = await pool.execute<RowDataPacket[]>(
    'SELECT invoice_number AS number, subtotal, tax_rate AS taxRate, tax_amount AS taxAmount, total, payment_method AS paymentMethod, payment_point AS paymentPoint, payment_status AS paymentStatus, billing_name AS billingName, billing_email AS billingEmail, issued_at AS issuedAt FROM invoices WHERE order_id = ? LIMIT 1',
    [id],
  )
  res.json({ ...order, items, invoice: invoices[0] ?? null })
}))

router.get('/orders', requireAuth, requireAdmin, asyncRoute(async (_req, res) => {
  const [orders] = await pool.execute<RowDataPacket[]>(
    "SELECT o.id, o.status, o.total, o.shipping_city AS city, o.created_at AS createdAt, u.name AS customerName, u.email AS customerEmail, i.invoice_number AS invoiceNumber, i.payment_status AS paymentStatus, COALESCE((SELECT GROUP_CONCAT(CONCAT(oi.product_name, ' x', oi.quantity) ORDER BY oi.id SEPARATOR ', ') FROM order_items oi WHERE oi.order_id = o.id), 'Pedido') AS product FROM orders o JOIN users u ON u.id = o.user_id LEFT JOIN invoices i ON i.order_id = o.id ORDER BY o.created_at DESC LIMIT 200",
  )
  res.json(orders)
}))

router.patch('/orders/:id/status', requireAuth, requireAdmin, asyncRoute(async (req, res) => {
  const id = z.coerce.number().int().positive().parse(req.params.id)
  const { status } = z.object({ status: z.enum(['processing', 'shipped', 'delivered', 'cancelled']) }).parse(req.body)
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    const [orders] = await connection.execute<(RowDataPacket & { status: string })[]>(
      'SELECT status FROM orders WHERE id = ? FOR UPDATE',
      [id],
    )
    const currentStatus = orders[0]?.status
    if (!currentStatus) throw new HttpError(404, 'No encontramos ese pedido.')
    const transitions: Record<string, string[]> = {
      pending: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered'],
      delivered: [],
      cancelled: [],
    }
    if (!transitions[currentStatus]?.includes(status)) throw new HttpError(409, 'Ese cambio de estado no está permitido.')
    if (status === 'cancelled') {
      const [items] = await connection.execute<(RowDataPacket & { productId: number; quantity: number })[]>(
        'SELECT product_id AS productId, quantity FROM order_items WHERE order_id = ? AND product_id IS NOT NULL',
        [id],
      )
      for (const item of items) {
        await connection.execute(
          'UPDATE products SET stock = stock + ?, sold_count = GREATEST(0, sold_count - ?) WHERE id = ?',
          [item.quantity, item.quantity, item.productId],
        )
      }
    }
    await connection.execute('UPDATE orders SET status = ? WHERE id = ?', [status, id])
    await connection.commit()
    res.json({ id, status })
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}))

router.get('/reviews', asyncRoute(async (req, res) => {
  const { limit } = z.object({ limit: z.coerce.number().int().min(1).max(100).default(50) }).parse(req.query)
  const [reviews] = await pool.execute<RowDataPacket[]>(
    `SELECT r.id, r.product_id AS productId, p.name AS productName,
      r.rating, r.comment, r.created_at AS createdAt, u.name AS author,
      EXISTS(
        SELECT 1 FROM order_items oi JOIN orders o ON o.id = oi.order_id
        WHERE oi.product_id = r.product_id AND o.user_id = r.user_id
          AND o.status IN ('processing', 'shipped', 'delivered')
      ) AS verifiedPurchase
     FROM reviews r JOIN products p ON p.id = r.product_id
     JOIN users u ON u.id = r.user_id
     WHERE r.approved = 1
     ORDER BY r.created_at DESC LIMIT ?`,
    [limit],
  )
  res.json(reviews)
}))

router.get('/products/:id/reviews', asyncRoute(async (req, res) => {
  const productId = z.coerce.number().int().positive().parse(req.params.id)
  const [reviews] = await pool.execute<RowDataPacket[]>(
    `SELECT r.id, r.rating, r.comment, r.created_at AS createdAt, u.name AS author,
      EXISTS(
        SELECT 1 FROM order_items oi JOIN orders o ON o.id = oi.order_id
        WHERE oi.product_id = r.product_id AND o.user_id = r.user_id
          AND o.status IN ('processing', 'shipped', 'delivered')
      ) AS verifiedPurchase
     FROM reviews r JOIN users u ON u.id = r.user_id
     WHERE r.product_id = ? AND r.approved = 1 ORDER BY r.created_at DESC LIMIT 100`,
    [productId],
  )
  res.json(reviews)
}))

router.post('/reviews', reviewLimiter, requireAuth, asyncRoute(async (req, res) => {
  const review = reviewSchema.parse(req.body)
  const [products] = await pool.execute<(RowDataPacket & { id: number })[]>(
    'SELECT id FROM products WHERE id = ? AND active = 1 LIMIT 1',
    [review.productId],
  )
  if (!products[0]) throw new HttpError(404, 'No encontramos ese producto disponible.')
  const [verifiedRows] = await pool.execute<(RowDataPacket & { verifiedPurchase: number })[]>(
    `SELECT EXISTS(
      SELECT 1 FROM order_items oi JOIN orders o ON o.id = oi.order_id
      WHERE oi.product_id = ? AND o.user_id = ? AND o.status IN ('processing', 'shipped', 'delivered')
    ) AS verifiedPurchase`,
    [review.productId, req.user!.id],
  )
  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
    [review.productId, req.user!.id, review.rating, review.comment],
  )
  res.status(201).json({
    id: result.insertId,
    ...review,
    author: req.user!.name,
    approved: false,
    verifiedPurchase: Boolean(verifiedRows[0]?.verifiedPurchase),
  })
}))

router.get('/admin/reviews', requireAuth, requireAdmin, asyncRoute(async (req, res) => {
  const { approved } = z.object({ approved: z.enum(['true', 'false']).default('false') }).parse(req.query)
  const [reviews] = await pool.execute<RowDataPacket[]>(
    'SELECT r.id, r.product_id AS productId, p.name AS productName, r.rating, r.comment, r.approved, r.created_at AS createdAt, u.name AS author FROM reviews r JOIN products p ON p.id = r.product_id JOIN users u ON u.id = r.user_id WHERE r.approved = ? ORDER BY r.created_at DESC LIMIT 200',
    [approved === 'true'],
  )
  res.json(reviews)
}))

router.patch('/admin/reviews/:id/approval', requireAuth, requireAdmin, asyncRoute(async (req, res) => {
  const id = z.coerce.number().int().positive().parse(req.params.id)
  const { approved } = z.object({ approved: z.boolean() }).parse(req.body)
  const [result] = await pool.execute<ResultSetHeader>('UPDATE reviews SET approved = ? WHERE id = ?', [approved, id])
  if (!result.affectedRows) throw new HttpError(404, 'No encontramos esa reseña.')
  res.json({ id, approved })
}))

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (error instanceof z.ZodError) {
    res.status(400).json({ error: 'Los datos enviados no son válidos.', details: error.issues.map(({ path, message }) => ({ field: path.join('.'), message })) })
    return
  }
  if (error instanceof HttpError) {
    res.status(error.status).json({ error: error.message })
    return
  }
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = String((error as { code?: string }).code ?? '')
    if (code === 'ER_DUP_ENTRY') {
      res.status(409).json({ error: 'Ya existe un registro con esos datos.' })
      return
    }
    if (['ER_BAD_FIELD_ERROR', 'ER_NO_SUCH_TABLE'].includes(code)) {
      res.status(503).json({
        error: 'Falta una tabla o columna requerida en MySQL. Aplica las migraciones pendientes del proyecto y reinicia la API.',
      })
      return
    }
    if (code === 'ER_NO_DEFAULT_FOR_FIELD') {
      res.status(503).json({
        error: 'La tabla de ofertas conserva una columna de producto obligatoria del esquema anterior. Aplica SQL/20261108_product_offers.sql y reinicia la API.',
      })
      return
    }
    if (['ECONNRESET', 'PROTOCOL_CONNECTION_LOST', 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR', 'ETIMEDOUT'].includes(code)) {
      res.status(503).json({ error: 'La base de datos no está disponible en este momento.' })
      return
    }
  }
  console.error(error)
  res.status(500).json({ error: 'Ocurrió un error interno.' })
}