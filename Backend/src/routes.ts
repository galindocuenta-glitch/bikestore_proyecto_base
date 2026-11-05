import { Router, type NextFunction, type Request, type Response } from 'express'
import { rateLimit } from 'express-rate-limit'
import bcrypt from 'bcryptjs'
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise'
import { z } from 'zod'
import { createToken, requireAdmin, requireAuth, type AuthUser } from './auth.js'
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

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-7', legacyHeaders: false })

router.get('/health', asyncRoute(async (_req, res) => {
  await pool.query('SELECT 1')
  res.json({ status: 'ok', database: 'connected' })
}))

router.post('/auth/register', loginLimiter, asyncRoute(async (req, res) => {
  const input = registerSchema.parse(req.body)
  const passwordHash = await bcrypt.hash(input.password, 12)
  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO users (name, email, password_hash, terms_accepted_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
    [input.name, input.email.toLowerCase(), passwordHash],
  )
  const user: AuthUser = { id: result.insertId, name: input.name, email: input.email.toLowerCase(), role: 'client' }
  res.status(201).json({ user, token: createToken(user) })
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
  res.json({ user, token: createToken(user) })
}))

router.get('/auth/me', requireAuth, (req, res) => res.json({ user: req.user }))

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
    "SELECT id, title, discount, code, DATE_FORMAT(valid_until, '%Y-%m-%d') AS validUntil, active FROM offers ORDER BY created_at DESC LIMIT 200",
  )
  res.json({ items: offers })
}))

router.post('/admin/offers', requireAuth, requireAdmin, asyncRoute(async (req, res) => {
  const offer = z.object({
    title: z.string().trim().min(2).max(120),
    discount: z.number().int().min(1).max(100),
    code: z.string().trim().min(2).max(40).transform((code) => code.toUpperCase()),
    validUntil: z.union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.literal('')]).optional(),
  }).parse(req.body)
  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO offers (title, discount, code, valid_until) VALUES (?, ?, ?, ?)',
    [offer.title, offer.discount, offer.code, offer.validUntil || null],
  )
  res.status(201).json({ id: result.insertId, ...offer, validUntil: offer.validUntil || '', active: true })
}))

router.patch('/admin/offers/:id/active', requireAuth, requireAdmin, asyncRoute(async (req, res) => {
  const id = z.coerce.number().int().positive().parse(req.params.id)
  const { active } = z.object({ active: z.boolean() }).parse(req.body)
  const [result] = await pool.execute<ResultSetHeader>('UPDATE offers SET active = ? WHERE id = ?', [active, id])
  if (!result.affectedRows) throw new HttpError(404, 'No encontramos esa oferta.')
  res.json({ id, active })
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
  const conditions = ['active = 1']
  const values: (string | number)[] = []
  if (querySchema.category && querySchema.category !== 'Todas') {
    conditions.push('p.category = ?')
    values.push(querySchema.category)
  }
  if (querySchema.search) {
    conditions.push('(p.name LIKE ? OR p.description LIKE ?)')
    values.push(`%${querySchema.search}%`, `%${querySchema.search}%`)
  }
  if (querySchema.minPrice !== undefined) { conditions.push('p.price >= ?'); values.push(querySchema.minPrice) }
  if (querySchema.maxPrice !== undefined) { conditions.push('p.price <= ?'); values.push(querySchema.maxPrice) }
  const orderBy = {
    relevance: 'p.created_at DESC',
    price_asc: 'p.price ASC',
    price_desc: 'p.price DESC',
    newest: 'p.created_at DESC',
    popular: 'p.sold_count DESC, p.created_at DESC',
  }[querySchema.sort]
  const where = conditions.join(' AND ')
  const offset = (querySchema.page - 1) * querySchema.limit
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT p.id, p.name, p.category, p.price, p.stock, p.description, p.image_url AS img, p.gallery, p.specs, p.badge, p.sold_count AS soldCount, COALESCE((SELECT ROUND(AVG(r.rating), 1) FROM reviews r WHERE r.product_id = p.id AND r.approved = 1), 0) AS rating, (SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id AND r.approved = 1) AS reviews, p.created_at AS createdAt FROM products p WHERE ${where} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
    [...values, querySchema.limit, offset],
  )
  const [countRows] = await pool.execute<(RowDataPacket & { total: number })[]>(
    `SELECT COUNT(*) AS total FROM products p WHERE ${where}`,
    values,
  )
  res.json({ items: rows, page: querySchema.page, limit: querySchema.limit, total: countRows[0].total })
}))

router.get('/products/:id', asyncRoute(async (req, res) => {
  const id = z.coerce.number().int().positive().parse(req.params.id)
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT p.id, p.name, p.category, p.price, p.stock, p.description, p.image_url AS img, p.gallery, p.specs, p.badge, p.sold_count AS soldCount, COALESCE((SELECT ROUND(AVG(r.rating), 1) FROM reviews r WHERE r.product_id = p.id AND r.approved = 1), 0) AS rating, (SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id AND r.approved = 1) AS reviews, p.created_at AS createdAt FROM products p WHERE p.id = ? AND p.active = 1 LIMIT 1',
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
      orderItems.push({ productId: product.id, name: product.name, unitPrice: product.price, quantity: item.quantity })
      subtotal += product.price * item.quantity
    }
    const taxRate = 19
    const taxAmount = Math.round(subtotal * taxRate / 100)
    const total = subtotal + taxAmount
    const [orderResult] = await connection.execute<ResultSetHeader>(
      'INSERT INTO orders (user_id, total, shipping_name, shipping_phone, shipping_department, shipping_city, shipping_address, shipping_notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
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
      status: 'pending',
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

router.get('/products/:id/reviews', asyncRoute(async (req, res) => {
  const productId = z.coerce.number().int().positive().parse(req.params.id)
  const [reviews] = await pool.execute<RowDataPacket[]>(
    'SELECT r.id, r.rating, r.comment, r.created_at AS createdAt, u.name AS author FROM reviews r JOIN users u ON u.id = r.user_id WHERE r.product_id = ? AND r.approved = 1 ORDER BY r.created_at DESC LIMIT 100',
    [productId],
  )
  res.json(reviews)
}))

router.post('/reviews', requireAuth, asyncRoute(async (req, res) => {
  const review = reviewSchema.parse(req.body)
  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
    [review.productId, req.user!.id, review.rating, review.comment],
  )
  res.status(201).json({ id: result.insertId, ...review, author: req.user!.name, approved: false })
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
  if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ER_DUP_ENTRY') {
    res.status(409).json({ error: 'Ya existe un registro con esos datos.' })
    return
  }
  console.error(error)
  res.status(500).json({ error: 'Ocurrió un error interno.' })
}