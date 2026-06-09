import bcrypt from 'bcryptjs'
import { neon } from '@neondatabase/serverless'

function getDatabaseUrl() {
  const url =
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.DATABASE_URL_UNPOOLED

  if (url) return url

  const user = process.env.POSTGRES_USER
  const password = process.env.POSTGRES_PASSWORD
  const host = process.env.PGHOST
  const database = process.env.POSTGRES_DATABASE || process.env.PGDATABASE

  if (user && password && host && database) {
    return `postgresql://${user}:${encodeURIComponent(password)}@${host}/${database}?sslmode=require`
  }

  throw new Error('Database not configured. Set POSTGRES_URL or Neon env vars.')
}

const email = process.env.ADMIN_EMAIL
const password = process.env.ADMIN_PASSWORD

if (!email || !password) {
  console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables')
  process.exit(1)
}

const sql = neon(getDatabaseUrl())

await sql`
  CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
  )
`

const hash = await bcrypt.hash(password, 10)
await sql`
  INSERT INTO users (email, password)
  VALUES (${email.toLowerCase()}, ${hash})
  ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password
`

await sql`
  CREATE TABLE IF NOT EXISTS cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('freedom', 'gap')),
    inputs JSONB NOT NULL,
    saved_at TIMESTAMPTZ DEFAULT now()
  )
`

console.log(`Seeded user: ${email}`)
