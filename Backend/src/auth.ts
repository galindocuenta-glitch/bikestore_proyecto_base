import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import type { RowDataPacket } from 'mysql2/promise'
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
  const authorization = req.header('authorization')
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null
  if (!token) {
    res.status(401).json({ error: 'Debes iniciar sesión para continuar.' })
    return
  }

  try {
    req.user = jwt.verify(token, jwtSecret()) as AuthUser
  } catch {
    res.status(401).json({ error: 'La sesión no es válida o ha expirado.' })
    return
  }
  void pool.execute<(RowDataPacket & { active: number })[]>(
    'SELECT active FROM users WHERE id = ? LIMIT 1',
    [req.user!.id],
  ).then(([rows]) => {
    if (!rows[0]?.active) {
      res.status(403).json({ error: 'La cuenta está deshabilitada o ya no existe.' })
      return
    }
    next()
  }).catch((error: unknown) => {
    console.error('No fue posible validar el estado de la cuenta.', error)
    res.status(500).json({ error: 'No fue posible validar la sesión.' })
  })
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ error: 'Esta operación requiere permisos de administrador.' })
    return
  }
  next()
}