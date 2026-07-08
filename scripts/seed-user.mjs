import bcrypt from 'bcryptjs'
import { existsSync, readFileSync } from 'fs'
import { neon } from '@neondatabase/serverless'

function loadEnvFile(path) {
  if (!existsSync(path)) return
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = value
  }
}

loadEnvFile('.env.local')
loadEnvFile('.env.example')

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
await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'`
await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true`

const hash = await bcrypt.hash(password, 10)
await sql`
  INSERT INTO users (email, password, role, is_active)
  VALUES (${email.toLowerCase()}, ${hash}, 'admin', true)
  ON CONFLICT (email) DO UPDATE SET
    password = EXCLUDED.password,
    role = 'admin',
    is_active = true
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

await sql`
  CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    key_prefix TEXT NOT NULL,
    key_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    last_used_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ
  )
`

console.log(`Seeded admin user: ${email}`)
