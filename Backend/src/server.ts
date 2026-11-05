import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import { errorHandler, router } from './routes.js'
import { pool } from './db.js'

const app = express()
const port = Number(process.env.PORT ?? 4000)
const allowedOrigins = (process.env.FRONTEND_ORIGIN ?? 'http://localhost:8443')
  .split(',')
  .map((origin) => origin.trim())
const isLocalDevelopmentOrigin = (origin: string) =>
  process.env.NODE_ENV !== 'production' && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)

app.use(helmet())
app.use(cors({
  origin: (origin, callback) => {
    callback(null, !origin || allowedOrigins.includes(origin) || isLocalDevelopmentOrigin(origin))
  },
}))
app.use(express.json({ limit: '1mb' }))
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
