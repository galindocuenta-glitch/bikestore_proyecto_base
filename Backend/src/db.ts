import 'dotenv/config'
import mysql from 'mysql2/promise'

const isProduction = process.env.NODE_ENV === 'production'
const dbUser = process.env.DB_USER ?? (isProduction ? '' : 'root')
const dbPassword = process.env.DB_PASSWORD ?? ''
const useSsl = process.env.DB_SSL === 'true'

if (isProduction && (dbUser === 'root' || !dbPassword || !useSsl)) {
  throw new Error('En producción configura un usuario MySQL dedicado, DB_PASSWORD y DB_SSL=true.')
}

export const pool = mysql.createPool({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 3306),
  user: dbUser,
  password: dbPassword,
  database: process.env.DB_NAME ?? 'bs_bike_store',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  decimalNumbers: true,
  ...(useSsl ? { ssl: { rejectUnauthorized: true } } : {}),
})