import bcrypt from 'bcryptjs'
import type { RowDataPacket } from 'mysql2'
import { z } from 'zod'
import { pool } from './db.js'

const adminConfigSchema = z.object({
  ADMIN_NAME: z.string().trim().min(2).default('Administrador BS'),
  ADMIN_EMAIL: z.string().trim().email(),
  ADMIN_PASSWORD: z.string().min(12).max(72),
})

/**
 * Al arrancar la API, crea el administrador inicial si todavía no existe.
 * Lee ADMIN_NAME, ADMIN_EMAIL y ADMIN_PASSWORD del entorno (Backend/.env). Si el correo ya está
 * registrado no toca nada (no cambia su clave ni su rol): para eso existe `npm run admin:create`.
 * Nunca detiene la API: ante cualquier problema lo avisa en consola y sigue.
 */
export async function ensureInitialAdmin(): Promise<void> {
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    console.log('Administrador inicial: ADMIN_EMAIL o ADMIN_PASSWORD están vacíos; no se crea ninguno.')
    return
  }
  const parsed = adminConfigSchema.safeParse(process.env)
  if (!parsed.success) {
    console.warn('Administrador inicial: configuración inválida (ADMIN_EMAIL debe ser un correo y ADMIN_PASSWORD de 12 a 72 caracteres). No se creó.')
    return
  }
  const config = parsed.data
  const email = config.ADMIN_EMAIL.toLowerCase()
  try {
    const [rows] = await pool.execute<(RowDataPacket & { role: string })[]>('SELECT role FROM users WHERE email = ? LIMIT 1', [email])
    if (rows[0]) {
      console.log(`Administrador inicial: ${email} ya existe (rol ${rows[0].role}); no se modificó.`)
      return
    }
    const passwordHash = await bcrypt.hash(config.ADMIN_PASSWORD, 12)
    await pool.execute(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [config.ADMIN_NAME, email, passwordHash, 'admin'],
    )
    console.log(`Administrador inicial creado: ${email}`)
  } catch (error) {
    console.error('Administrador inicial: no fue posible crearlo (¿MySQL, usuario/clave o tablas listas?).', error instanceof Error ? error.message : error)
  }
}
