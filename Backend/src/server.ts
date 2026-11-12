import 'dotenv/config'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import express from 'express'
import helmet from 'helmet'
import { errorHandler, router } from './routes.js'
import { pool } from './db.js'
import { ensureInitialAdmin } from './bootstrap-admin.js'

const app = express()
const port = Number(process.env.PORT ?? 4000)
const isProduction = process.env.NODE_ENV === 'production'
const allowedOrigins = (process.env.FRONTEND_ORIGIN ?? 'http://localhost:8444')
  .split(',')
  .map((origin) => origin.trim())
const isLocalDevelopmentOrigin = (origin: string) =>
  process.env.NODE_ENV !== 'production' && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
const isPrivateNetworkDevelopmentOrigin = (origin: string): boolean => {
  if (process.env.NODE_ENV === 'production') return false
  let url: URL
  try {
    url = new URL(origin)
  } catch {
    return false
  }
  if (url.protocol !== 'http:') return false
  const octets = url.hostname.split('.').map(Number)
  if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) return false
  return octets[0] === 10
    || (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31)
    || (octets[0] === 192 && octets[1] === 168)
}
const isAllowedOrigin = (origin: string) =>
  allowedOrigins.includes(origin) || isLocalDevelopmentOrigin(origin) || isPrivateNetworkDevelopmentOrigin(origin)

if (isProduction && (
  !process.env.JWT_SECRET ||
  process.env.JWT_SECRET.length < 32 ||
  allowedOrigins.some((origin) => !origin.startsWith('https://'))
)) {
  throw new Error('Producción requiere JWT_SECRET de al menos 32 caracteres y FRONTEND_ORIGIN HTTPS.')
}

app.use(helmet())
app.use(cors({
  origin: (origin, callback) => {
    callback(null, !origin || isAllowedOrigin(origin))
  },
  credentials: true,
}))
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())
app.use('/api', (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    next()
    return
  }
  const origin = req.get('origin')
  if (!origin || !isAllowedOrigin(origin)) {
    res.status(403).json({ error: 'Origen no autorizado para esta operación.' })
    return
  }
  next()
})
app.use('/api', router)
app.use((_req, res) => res.status(404).json({ error: 'Ruta no encontrada.' }))
app.use(errorHandler)

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`BS Bike Store API disponible en http://0.0.0.0:${port}/api`)
  void ensureInitialAdmin()
})

async function shutdown(): Promise<void> {
  server.close()
  await pool.end()
  process.exit(0)
}

process.on('SIGINT', () => void shutdown())
process.on('SIGTERM', () => void shutdown())
