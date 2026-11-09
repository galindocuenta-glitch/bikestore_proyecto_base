import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import type { RowDataPacket } from 'mysql2/promise'
import { z } from 'zod'
import { pool } from './db.js'

export type UserRole = 'client' | 'admin'
export interface AuthUser {
  id: number
  name: string
  email: string
  role: UserRole
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
    }
  }
}

function jwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET debe tener al menos 32 caracteres.')
  }
  return secret
}

export function createToken(user: AuthUser): string {
  const expiresIn = process.env.JWT_EXPIRES_IN ?? '1d'
  return jwt.sign(user, jwtSecret(), { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] })
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.['bs-bike-store-session'] as string | undefined
  if (!token) {
    res.status(401).json({ error: 'Debes iniciar sesión para continuar.' })
    return
  }

  try {
    const payload = jwt.verify(token, jwtSecret(), { algorithms: ['HS256'] })
    const user = z.object({
      id: z.number().int().positive(),
      name: z.string().min(1),
      email: z.string().email(),
      role: z.enum(['client', 'admin']),
    }).safeParse(payload)
    if (!user.success) throw new Error('Invalid token claims')
    req.user = user.data
  } catch {
    res.status(401).json({ error: 'La sesión no es válida o ha expirado.' })
    return
  }
  void pool.execute<(RowDataPacket & { id: number; name: string; email: string; role: UserRole; active: number })[]>(
    'SELECT id, name, email, role, active FROM users WHERE id = ? LIMIT 1',
    [req.user.id],
  ).then(([rows]) => {
    const account = rows[0]
    if (!account?.active) {
      res.status(403).json({ error: 'La cuenta está deshabilitada o ya no existe.' })
      return
    }
    req.user = {
      id: account.id,
      name: account.name,
      email: account.email,
      role: account.role,
    }
    next()
  }).catch((error: unknown) => {
    console.error('No fue posible validar el estado de la cuenta.', error)
    res.status(500).json({ error: 'No fue posible validar la sesión.' })
  })
}

export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.['bs-bike-store-session'] as string | undefined
  if (!token) {
    next()
    return
  }

  let userId: number
  try {
    const payload = jwt.verify(token, jwtSecret(), { algorithms: ['HS256'] })
    const user = z.object({
      id: z.number().int().positive(),
      name: z.string().min(1),
      email: z.string().email(),
      role: z.enum(['client', 'admin']),
    }).safeParse(payload)
    if (!user.success) throw new Error('Invalid token claims')
    userId = user.data.id
  } catch {
    res.status(401).json({ error: 'La sesión no es válida o ha expirado.' })
    return
  }

  void pool.execute<(RowDataPacket & { id: number; name: string; email: string; role: UserRole; active: number })[]>(
    'SELECT id, name, email, role, active FROM users WHERE id = ? LIMIT 1',
    [userId],
  ).then(([rows]) => {
    const account = rows[0]
    if (!account?.active) {
      res.status(403).json({ error: 'La cuenta está deshabilitada o ya no existe.' })
      return
    }
    req.user = {
      id: account.id,
      name: account.name,
      email: account.email,
      role: account.role,
    }
    next()
  }).catch(next)
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ error: 'Esta operación requiere permisos de administrador.' })
    return
  }
  next()
}