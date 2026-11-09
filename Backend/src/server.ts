import 'dotenv/config'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import express from 'express'
import helmet from 'helmet'
import { errorHandler, router } from './routes.js'
import { pool } from './db.js'

const app = express()
const port = Number(process.env.PORT ?? 4000)
const isProduction = process.env.NODE_ENV === 'production'
const allowedOrigins = (process.env.FRONTEND_ORIGIN ?? 'http://localhost:8443')
  .split(',')
  .map((origin) => origin.trim())
const isLocalDevelopmentOrigin = (origin: string) =>
  process.env.NODE_ENV !== 'production' && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)

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
    callback(null, !origin || allowedOrigins.includes(origin) || isLocalDevelopmentOrigin(origin))
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
  if (!origin || (!allowedOrigins.includes(origin) && !isLocalDevelopmentOrigin(origin))) {
    res.status(403).json({ error: 'Origen no autorizado para esta operación.' })
    return
  }
  next()
})
app.use('/api', router)
app.use((_req, res) => res.status(404).json({ error: 'Ruta no encontrada.' }))
app.use(errorHandler)

const server = app.listen(port, () => {
  console.log(`BS Bike Store API disponible en http://localhost:${port}/api`)
})

async function shutdown(): Promise<void> {
  server.close()
  await pool.end()
  process.exit(0)
}

process.on('SIGINT', () => void shutdown())
process.on('SIGTERM', () => void shutdown())
