import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { pool } from '../db.js'

const config = z.object({
  ADMIN_NAME: z.string().trim().min(2).default('Administrador BS'),
  ADMIN_EMAIL: z.string().trim().email("galindocuenta@gmail.com"),
  ADMIN_PASSWORD: z.string().min(12).max(72),
}).parse(process.env)

try {
  const passwordHash = await bcrypt.hash(config.ADMIN_PASSWORD, 12)
  await pool.execute(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), password_hash = VALUES(password_hash), role = VALUES(role)',
    [config.ADMIN_NAME, config.ADMIN_EMAIL.toLowerCase(), passwordHash, 'admin'],
  )
  console.log(`Administrador configurado: ${config.ADMIN_EMAIL.toLowerCase()}`)
} finally {
  await pool.end()
}